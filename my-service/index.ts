import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Get the names of the parameters we care about from the shared-config stack.
const stack = new pulumi.StackReference("cnunciato/shared-config/dev"); // <-- Your name here.
const motdParamRef = stack.requireOutput("motd_param_name");
const motdSecretParamRef = stack.requireOutput("motd_secret_param_name");

const callback = new aws.lambda.CallbackFunction("lambda", {
    policies: [
        aws.iam.ManagedPolicy.LambdaFullAccess,

        // Give the Lambda read-only access to AWS Systems Manager.
        aws.iam.ManagedPolicy.AmazonSSMReadOnlyAccess
    ],
    callback: async () => {

        // Use the AWS SDK for JavaScript to fetch parameter values from Systems Manager.
        const ssm = new aws.sdk.SSM();

        // Fetch the message of the day.
        const motdParam = await ssm.getParameter({
            Name: motdParamRef.get(),  // <-- Use .get() for you runtime access to Output values.
        }).promise();

        // Fetch the secret message of the day.
        const motdSecretParam = await ssm.getParameter({
            Name: motdSecretParamRef.get(),
            WithDecryption: true,
        }).promise();

        return {
            statusCode: 200,
            contentType: "application/json",

            // Return the result.
            body: JSON.stringify({
                motd: motdParam.Parameter?.Value,
                motd_secret: motdSecretParam.Parameter?.Value
            }),
        };
    },
});

const lambdaUrl = new aws.lambda.FunctionUrl("lambda-url", {
    functionName: callback.name,
    authorizationType: "NONE",
});

// Export the publicly accessible URL of the service.
export const url = lambdaUrl.functionUrl;
