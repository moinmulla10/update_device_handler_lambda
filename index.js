const AWS = require('aws-sdk');
const Alexa = require("ask-sdk-core");

const iotData = new AWS.IotData({region: 'us-east-1', endpoint: 'a19poveleatzc-ats.iot.us-east-1.amazonaws.com'});

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

const ChangeTemperatureIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "changeTemperatureIntent"
    );
  },
  async handle(handlerInput) {
    //get slot value new temperature
    const slotValue = Alexa.getSlotValue(handlerInput.requestEnvelope, "newTemperature");
    const response = await updateDeviceShadowDesiredState(parseInt(slotValue));

    return (
      handlerInput.responseBuilder
        .speak(response)
        .reprompt()
        .getResponse()
    );
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
    ChangeTemperatureIntentHandler,
    CancelAndStopIntentHandler,
    FallbackIntentHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

async function updateDeviceShadowDesiredState(newTemperature) {
  const params = {
    thingName: "airConditioner",
    payload: JSON.stringify({
      state: {
        desired: {
          temperature: newTemperature,
        },
      },
    }),
  };

  try {
    const response = await iotData.updateThingShadow(params).promise();
    console.log(response);
    console.log("Shadow updated!");
    console.log("deployment successful");
    return 'Shadow updated successfully by Moin';
  } catch (err) {
    console.log("Error updating shadow:", err);
    return 'Some error occurred!';
  }
}
