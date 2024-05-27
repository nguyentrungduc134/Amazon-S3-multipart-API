## Overview
 The customer plugin receives requests from Salesforce and generates the appropriate format for storage in the customer sandbox.
## Workflow

![etl2](https://github.com/INFRALESS-IO/cloudconsultantsch-sf-plugins/assets/86754554/6ea9b948-0ff9-4042-a463-ff2d358c64a6)
- **Validation and customer routing**: Proxy requests from one Lambda function to multiple other Lambda functions based on the request body by inspecting it and routing the request accordingly.
##
        // Extract the field from the request body
        const body = JSON.parse(event.body);
        const fieldValue = body.customers;

        // Check the value of the field
        if (fieldValue === 'customer1') {
            // Construct parameters for sending a message to the SQS queue
            const params = {
                QueueUrl: 'customer1',
                MessageBody: JSON.stringify(body)
            };

            // Send a message to the SQS queue
            const result = await sqs.sendMessage(params).promise();
 - **Transform plane lambdas:** Transform the input payload into the appropriate output format, such as generating an XML file based on a predefined template.
##
		const xmlbuilder = require('xmlbuilder');

		// Create a new XML document
		const root = xmlbuilder.create('root');

		// Add elements to the XML document
		root.ele('portal', 'portal1');
		root.ele('propertType', 'properType1');
		root.ele('title', 'value1');
		root.ele('price', 'value2');

		// Add attributes to an element
		root.ele('address', { 'attribute1': 'value1', 'attribute2': 'value2' });

		// Convert the XML document to a string
		const xml = root.end({ pretty: true });

		console.log(xml);
### Output
##
		<root>
  			<portal>portal1</portal>
			<propertType>propertType1</propertType>
			<title>value1</title>
			<price>value2</price>
			<address attribute1="value1" attribute2="value2"/>
		</root>
- **The consumer Lambda function**: handles request-response interactions with the customer endpoint using the appropriate protocol
- **Dead letter queue**: For each processing error, the SQS queue attempts to redeliver the message. If the message fails delivery a certain number of times (n), it can be moved to a dead letter queue until any issues with the external service are resolved.
  
