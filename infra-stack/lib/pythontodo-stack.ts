import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ddb from "aws-cdk-lib/aws-dynamodb"
import * as lambda from "aws-cdk-lib/aws-lambda"
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PythontodoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    //Create dynamo db table  DDB table to store the tasks
    const table = new ddb.Table(this, "Task", {
      partitionKey: { name: "task_id", type: ddb.AttributeType.STRING },
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: "tt1"
    })
    //add GSI based on user._id
    table.addGlobalSecondaryIndex({
      indexName: "user-index",
      partitionKey: { name: "user_id", type: ddb.AttributeType.STRING },
      sortKey: { name: "created_time", type: ddb.AttributeType.NUMBER }
    })
    /// Create Lambda Function for the api
    const api = new lambda.Function(this, "API", {
      runtime: lambda.Runtime.PYTHON_3_9,
      code: lambda.Code.fromAsset("../api"),
      handler: "todo.handler",
      environment: {
        TABLE_NAME: table.tableName
      }
    })
    /// Create a URL so we can acess the function
    const functionUrl = api.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [lambda.HttpMethod.ALL],
        allowedHeaders: ["*"]
      }
    })
    /// Output the API Functio url 
    new cdk.CfnOutput(this, "APIUrl", {
      value: functionUrl.url
    })
    //this gives lambda Permission  to read/write 
    table.grantReadWriteData(api)
  }
}
