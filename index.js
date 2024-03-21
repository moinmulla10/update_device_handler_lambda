const AWS = require("aws-sdk");
const Alexa = require("ask-sdk-core");

const iotData = new AWS.IotData({
  region: "us-east-1",
  endpoint: "a19poveleatzc-ats.iot.us-east-1.amazonaws.com",
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    const speakOutput = "Welcome from Moin from Happiest Minds";

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

    try {
      const thing = await getThingFromDynamoDB(
        parseInt(roomNoSlotValue),
        deviceType
      );
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
      await updateDynamoDBThing(thing.deviceId, desiredStateChange);
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

    try {
      const thing = await getThingFromDynamoDB(
        parseInt(roomNoSlotValue),
        deviceType
      );
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
      await updateDynamoDBThing(thing.deviceId, desiredStateChange);
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

    try {
      const thing = await getThingFromDynamoDB(
        parseInt(roomNoSlotValue),
        deviceType
      );
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
      await updateDynamoDBThing(thing.deviceId, desiredStateChange);
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
    return "Some error occurred!";
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
  } else if (deviceType === "light") {
    return {
      thingName: thingName,
      payload: JSON.stringify({
        state: {
          desired: {
            status: desiredStateChange,
          },
        },
      }),
    };
  }
}

async function getThingFromDynamoDB(roomNo, deviceType) {
  const dynamoDBParams = {
    TableName: "IOT_Devices",
    KeyConditionExpression: "#roomNo = :value1 AND #deviceType = :value2",
    ExpressionAttributeNames: {
      '#roomNo': 'roomNo',
      '#deviceType': 'deviceType',
    },
    ExpressionAttributeValues: {
      ":value1": roomNo,
      ":value2": deviceType,
    },
  };

  const data = await dynamodb.query(dynamoDBParams).promise();
  console.log('Data Items',data.Items);
  return data.Items[0];
}

async function updateDynamoDBThing(deviceId, temperature) {
  const dynamodbUpdateParams = {
    TableName: "IOT_Devices",
    Key: {
      deviceId: deviceId,
    },
    UpdateExpression: "SET temperature = :value",
    ExpressionAttributeValues: {
      ":value": temperature,
    },
  };
  await dynamodb.update(dynamodbUpdateParams).promise();
}
