import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Remote Config key for storing the config array
const REMOTE_CONFIG_KEY = "config_holiday_offset";

/**
 * Returns the list of admin emails authorized to use this admin panel
 */
function getAdminEmails(): string[] {
  return [
    "you@gmail.com",
    "pastor@gmail.com",
    "coordinator@gmail.com",
  ];
}

/**
 * Middleware to verify Firebase ID token and check admin email authorization
 */
async function verifyAuth(request: functions.https.Request): Promise<{
  authorized: boolean;
  email?: string;
  error?: string;
}> {
  try {
    // Get the authorization header
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        authorized: false,
        error: "Unauthorized: No token provided",
      };
    }

    // Extract the token
    const idToken = authHeader.split("Bearer ")[1];

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Check if email exists
    if (!decodedToken.email) {
      return {
        authorized: false,
        error: "Unauthorized: No email in token",
      };
    }

    // Check if email is in the admin list
    const adminEmails = getAdminEmails();
    if (!adminEmails.includes(decodedToken.email)) {
      return {
        authorized: false,
        error: `Forbidden: ${decodedToken.email} is not authorized`,
      };
    }

    return {
      authorized: true,
      email: decodedToken.email,
    };
  } catch (error) {
    console.error("Error verifying auth:", error);
    return {
      authorized: false,
      error: "Invalid token",
    };
  }
}

/**
 * Cloud Function: Get current remote config
 * Returns the JSON array stored in Remote Config
 */
export const getRemoteConfig = functions.https.onRequest(
  async (request, response) => {
    // Enable CORS
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    try {
      // Verify authentication
      const authResult = await verifyAuth(request);
      if (!authResult.authorized) {
        response.status(authResult.error?.includes("Forbidden") ? 403 : 401)
          .json({error: authResult.error});
        return;
      }

      // Get the Remote Config template
      const template = await admin.remoteConfig().getTemplate();

      // Get the config_holiday_offset parameter
      const configParam = template.parameters[REMOTE_CONFIG_KEY];

      if (!configParam || !configParam.defaultValue) {
        response.status(404).json({
          error: "Remote config parameter not found",
          key: REMOTE_CONFIG_KEY,
        });
        return;
      }

      // Parse and return the config array
      const configValue = (configParam.defaultValue as any).value;
      const configArray = JSON.parse(configValue);

      response.status(200).json({
        success: true,
        data: configArray,
        email: authResult.email,
      });
    } catch (error: any) {
      console.error("Error getting remote config:", error);
      response.status(500).json({
        error: "Failed to get remote config",
        details: error.message,
      });
    }
  }
);

/**
 * Cloud Function: Update remote config
 * Accepts entire config array and updates Remote Config
 */
export const updateRemoteConfig = functions.https.onRequest(
  async (request, response) => {
    // Enable CORS
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({error: "Method not allowed"});
      return;
    }

    try {
      // Verify authentication
      const authResult = await verifyAuth(request);
      if (!authResult.authorized) {
        response.status(authResult.error?.includes("Forbidden") ? 403 : 401)
          .json({error: authResult.error});
        return;
      }

      // Get the new config array from request body
      const {configArray} = request.body;

      if (!Array.isArray(configArray)) {
        response.status(400).json({
          error: "Invalid request: configArray must be an array",
        });
        return;
      }

      // Validate the config array structure
      for (const config of configArray) {
        const requiredFields = [
          "offset_description",
          "offset_eid_al_adha",
          "offset_eid_al_fitr",
          "offset_mawlid",
          "offset_greg_year",
          "offset_ethio_year",
          "offset_hirji_year",
          "offset_stage",
        ];

        for (const field of requiredFields) {
          if (!(field in config)) {
            response.status(400).json({
              error: `Invalid config: missing field '${field}'`,
            });
            return;
          }
        }
      }

      // Get the current Remote Config template
      const template = await admin.remoteConfig().getTemplate();

      // Update the config_holiday_offset parameter
      template.parameters[REMOTE_CONFIG_KEY] = {
        defaultValue: {
          value: JSON.stringify(configArray),
        },
        description: "Holiday offset configuration array for EthioCal",
      };

      // Publish the updated template
      const updatedTemplate = await admin.remoteConfig().publishTemplate(template);

      response.status(200).json({
        success: true,
        message: "Remote config updated successfully",
        version: updatedTemplate.version,
        email: authResult.email,
      });
    } catch (error: any) {
      console.error("Error updating remote config:", error);
      response.status(500).json({
        error: "Failed to update remote config",
        details: error.message,
      });
    }
  }
);

/**
 * Cloud Function: Send Cloud Messaging notification
 * Sends FCM notification to specified topic or token
 */
export const sendMessage = functions.https.onRequest(
  async (request, response) => {
    // Enable CORS
    response.set("Access-Control-Allow-Origin", "*");
    response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (request.method === "OPTIONS") {
      response.status(204).send("");
      return;
    }

    if (request.method !== "POST") {
      response.status(405).json({error: "Method not allowed"});
      return;
    }

    try {
      // Verify authentication
      const authResult = await verifyAuth(request);
      if (!authResult.authorized) {
        response.status(authResult.error?.includes("Forbidden") ? 403 : 401)
          .json({error: authResult.error});
        return;
      }

      const {
        topic,
        token,
        title,
        body,
        category,
        priority,
        actionType,
        actionTarget,
        actionLabel,
        imageUrl,
      } = request.body;

      // Validate required fields
      if (!title || !body) {
        response.status(400).json({
          error: "Missing required fields: title and body are required",
        });
        return;
      }

      if (!topic && !token) {
        response.status(400).json({
          error: "Either topic or token must be provided",
        });
        return;
      }

      // Build the message data
      const messageData: {[key: string]: string} = {
        title,
        body,
      };

      // Add optional fields if provided
      if (category) messageData.category = category;
      if (priority) messageData.priority = priority;
      if (actionType) messageData.actionType = actionType;
      if (actionTarget) messageData.actionTarget = actionTarget;
      if (actionLabel) messageData.actionLabel = actionLabel;
      if (imageUrl) messageData.imageUrl = imageUrl;

      // Build the FCM message
      const message: admin.messaging.Message = {
        data: messageData,
        ...(topic ? {topic} : {token: token as string}),
        android: {
          priority: "high",
          notification: {
            title,
            body,
            ...(imageUrl ? {imageUrl} : {}),
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title,
                body,
              },
              sound: "default",
            },
          },
          ...(imageUrl ? {
            fcmOptions: {
              imageUrl,
            },
          } : {}),
        },
      };

      // Send the message
      const messageId = await admin.messaging().send(message);

      response.status(200).json({
        success: true,
        messageId,
        sentTo: topic || token,
        email: authResult.email,
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      response.status(500).json({
        error: "Failed to send message",
        details: error.message,
      });
    }
  }
);
