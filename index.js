const AWS = require("aws-sdk");
const Alexa = require("ask-sdk-core");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const iotData = new AWS.IotData({
  region: "us-east-1",
  endpoint: "a19poveleatzc-ats.iot.us-east-1.amazonaws.com",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();
const ses = new SESClient({ region: "us-east-1" });

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Please tell me what device you want to control";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const ChangeACTemperatureIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "changeAirConditionerTemperature"
    );
  },
  async handle(handlerInput) {
    const roomNoSlotValue = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "roomNo"
    );

    const deviceType = "air_conditioner";

    const temperatureSlotValue = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "newTemperature"
    );
    const desiredStateChange = parseInt(temperatureSlotValue);

    console.log("desiredStateChange", desiredStateChange);
    console.log("roomNoSlotValue", roomNoSlotValue);
    let thing;
    try {
      thing = await getThingFromDynamoDB(parseInt(roomNoSlotValue), deviceType);
      console.log("Thing", thing);
    } catch (error) {
      console.log("Error in getThingFromDynamoDB", error);
      return handlerInput.responseBuilder
        .speak("Some error occurred in finding thing in dynamoDB")
        .reprompt()
        .getResponse();
    }

    const response = await updateDeviceShadowDesiredState(
      thing.thingName,
      deviceType,
      desiredStateChange
    );

    try {
      await updateDynamoDBThing(deviceType, thing.deviceId, desiredStateChange);
    } catch (error) {
      console.log("Error in updateThingInDynamoDB", error);
      return handlerInput.responseBuilder
        .speak("Some error occurred while updating dynamodb table")
        .reprompt()
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak(response)
      .reprompt()
      .getResponse();
  },
};

const TurnLightBulbOnOffIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "turnLightBulbOnOff"
    );
  },
  async handle(handlerInput) {
    const roomNoSlotValue = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "roomNo"
    );

    const deviceType = "light_bulb";

    const onOffStatus = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "onOffStatus"
    );
    const desiredStateChange = onOffStatus;

    let thing;
    try {
      thing = await getThingFromDynamoDB(parseInt(roomNoSlotValue), deviceType);
      console.log("Thing", thing);
    } catch (error) {
      console.log("Error in getThingFromDynamoDB", error);
      return handlerInput.responseBuilder
        .speak("Some error occurred in finding thing in dynamoDB")
        .reprompt()
        .getResponse();
    }

    const response = await updateDeviceShadowDesiredState(
      thing.thingName,
      deviceType,
      desiredStateChange
    );

    try {
      await updateDynamoDBThing(deviceType, thing.deviceId, desiredStateChange);
    } catch (error) {
      console.log("Error in updateThingInDynamoDB", error);
      return handlerInput.responseBuilder
        .speak("Some error occurred while updating dynamodb table")
        .reprompt()
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak(response)
      .reprompt()
      .getResponse();
  },
};

const ChangeFanSpeedIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "changeFanSpeed"
    );
  },
  async handle(handlerInput) {
    const roomNoSlotValue = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "roomNo"
    );

    const deviceType = "fan";
    const fanSpeedSlotValue = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "fanSpeed"
    );

    desiredStateChange = parseInt(fanSpeedSlotValue);

    let thing;
    try {
      thing = await getThingFromDynamoDB(parseInt(roomNoSlotValue), deviceType);
      console.log("Thing", thing);
    } catch (error) {
      console.log("Error in getThingFromDynamoDB", error);
      return handlerInput.responseBuilder
        .speak("Some error occurred in finding thing in dynamoDB")
        .reprompt()
        .getResponse();
    }

    const response = await updateDeviceShadowDesiredState(
      thing.thingName,
      deviceType,
      desiredStateChange
    );

    try {
      await updateDynamoDBThing(deviceType, thing.deviceId, desiredStateChange);
    } catch (error) {
      console.log("Error in updateThingInDynamoDB", error);
      return handlerInput.responseBuilder
        .speak("Some error occurred while updating dynamodb table")
        .reprompt()
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak(response)
      .reprompt()
      .getResponse();
  },
};

const ReportDeviceFailureIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "reportDeviceFailure"
    );
  },
  async handle(handlerInput) {
    const roomNoSlotValue = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "roomNo"
    );

    const deviceTypeSlotValue = Alexa.getSlotValue(
      handlerInput.requestEnvelope,
      "deviceType"
    );

    let deviceType;
    if (
      deviceTypeSlotValue === "AC" ||
      deviceTypeSlotValue === "air conditioner"
    ) {
      deviceType = "air_conditioner";
    } else if (deviceTypeSlotValue.includes("bulb")) {
      deviceType = "light_bulb";
    } else if (deviceTypeSlotValue.includes("fan")) {
      deviceType = "fan";
    }

    let thing;
    try {
      thing = await getThingFromDynamoDB(parseInt(roomNoSlotValue), deviceType);
      console.log("Thing", thing);
    } catch (error) {
      console.log("Error in getThingFromDynamoDB", error);
      return handlerInput.responseBuilder
        .speak("Some error occurred in finding thing in dynamoDB")
        .reprompt()
        .getResponse();
    }

    try {
      await reportDeviceFailure(
        deviceTypeSlotValue,
        thing.deviceId,
        parseInt(roomNoSlotValue)
      );
    } catch (error) {
      console.log("Error in reporting device failure", error);
      return handlerInput.responseBuilder
        .speak("Some error occurred while reporting device failure")
        .reprompt()
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak("Device failure reported successfully")
      .reprompt()
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent")
    );
  },
  handle(handlerInput) {
    const speakOutput = "Stoppping Alexa. Goodbye!";

    return handlerInput.responseBuilder.speak(speakOutput).getResponse();
  },
};

const FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Sorry. I could not understand what you are saying!";

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    const speakOutput = "Some Error occurred";
    console.log(`~~~~ Error handled: ${JSON.stringify(error.stack)}`);

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};

exports.updateDeviceStateHandler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    LaunchRequestHandler,
    ChangeACTemperatureIntentHandler,
    ChangeFanSpeedIntentHandler,
    TurnLightBulbOnOffIntentHandler,
    ReportDeviceFailureIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

async function updateDeviceShadowDesiredState(
  thingName,
  deviceType,
  desiredStateChange
) {
  const params = getDeviceShadowUpdateParams(
    thingName,
    deviceType,
    desiredStateChange
  );

  try {
    const response = await iotData.updateThingShadow(params).promise();
    console.log(response);
    console.log("Shadow updated!");
    return "Shadow updated successfully";
  } catch (err) {
    console.log("Error updating shadow:", err);
    return "Some error occurred while updating shadow!";
  }
}

function getDeviceShadowUpdateParams(
  thingName,
  deviceType,
  desiredStateChange
) {
  if (deviceType === "air_conditioner") {
    return {
      thingName: thingName,
      payload: JSON.stringify({
        state: {
          desired: {
            temperature: desiredStateChange,
          },
        },
      }),
    };
  } else if (deviceType === "fan") {
    return {
      thingName: thingName,
      payload: JSON.stringify({
        state: {
          desired: {
            speed: desiredStateChange,
          },
        },
      }),
    };
  } else if (deviceType === "light_bulb") {
    return {
      thingName: thingName,
      payload: JSON.stringify({
        state: {
          desired: {
            onOffStatus: desiredStateChange,
          },
        },
      }),
    };
  }
}

async function getThingFromDynamoDB(roomNo, deviceType) {
  const dynamoDBParams = {
    TableName: "IOT_Devices",
    FilterExpression: "#roomNo = :value1 AND #deviceType = :value2",
    ExpressionAttributeNames: {
      "#roomNo": "roomNo",
      "#deviceType": "deviceType",
    },
    ExpressionAttributeValues: {
      ":value1": roomNo,
      ":value2": deviceType,
    },
  };

  const data = await dynamodb.scan(dynamoDBParams).promise();
  console.log("Data Items", data.Items);
  return data.Items[0];
}

async function updateDynamoDBThing(deviceType, deviceId, desiredStateChange) {
  let dynamodbUpdateParams;
  if (deviceType === "air_conditioner") {
    dynamodbUpdateParams = {
      TableName: "IOT_Devices",
      Key: {
        deviceId: deviceId,
      },
      UpdateExpression: "SET temperature = :value",
      ExpressionAttributeValues: {
        ":value": desiredStateChange,
      },
    };
  } else if (deviceType === "light_bulb") {
    dynamodbUpdateParams = {
      TableName: "IOT_Devices",
      Key: {
        deviceId: deviceId,
      },
      UpdateExpression: "SET onOffStatus = :value",
      ExpressionAttributeValues: {
        ":value": desiredStateChange,
      },
    };
  } else if (deviceType === "fan") {
    dynamodbUpdateParams = {
      TableName: "IOT_Devices",
      Key: {
        deviceId: deviceId,
      },
      UpdateExpression: "SET speed = :value",
      ExpressionAttributeValues: {
        ":value": desiredStateChange,
      },
    };
  }

  await dynamodb.update(dynamodbUpdateParams).promise();
}

async function reportDeviceFailure(deviceTypeSlotValue, deviceId, roomNo) {
  const dynamodbUpdateParams = {
    TableName: "IOT_Devices",
    Key: {
      deviceId: deviceId,
    },
    UpdateExpression: "SET workingCondition = :value",
    ExpressionAttributeValues: {
      ":value": false,
    },
  };

  await dynamodb.update(dynamodbUpdateParams).promise();
  await sendDeviceFailureEmail(deviceTypeSlotValue, roomNo);
  await publishToDeviceFailureTopic();
}

async function sendDeviceFailureEmail(deviceTypeSlotValue, roomNo) {
  const command = new SendEmailCommand({
    Destination: {
      ToAddresses: ["moinmulla10@gmail.com"],
    },
    Message: {
      Body: {
        Text: {
          Data: `A ${deviceTypeSlotValue} has stopped working in room number ${roomNo}! Please look into it.`,
        },
      },

      Subject: { Data: "Device failure emergency alert!" },
    },
    Source: "moin.mulla@happiestminds.com",
  });

  try {
    let response = await ses.send(command);
    // process data.
    return response;
  } catch (error) {
    console.log(error);
  } finally {
    // finally.
  }
}

async function publishToDeviceFailureTopic() {
  const deviceFailureTopicParams = {
    topic: "moin/deviceFailure",
    payload: {
      message: "Hello from AWS.IotData!"
    },
    qos: 0,
  };

  // Publish message to the device-specific MQTT topic
  iotData.publish(deviceFailureTopicParams, (err, data) => {
    if (err) {
      console.error("Error publishing message:", err);
    } else {
      console.log("Message published successfully:", data);
    }
  });
}
