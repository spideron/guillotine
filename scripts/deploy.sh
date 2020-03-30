#!/bin/bash

FUNCTION_NAME=$1 # get the function name from the first argument
FUNCTIONS_FOLDER="/home/ec2-user/environment/guillotine/lambda/"
DEPLOYMENTS_FOLDER="/home/ec2-user/environment/guillotine/deployments/"
RUNTIME="nodejs12.x"
ROLE="arn:aws:iam::288504654618:role/Guillotine_Lambda_Execution_Role"

# Check if an argument of the function name been set as argument
if [ -z "${FUNCTION_NAME}" ]
  then
    echo "No argument supplied"
    exit 1
  else
    FUNCTION_FILE="${FUNCTIONS_FOLDER}${FUNCTION_NAME}.js"
fi

# Check if the function file exists
if [[ ! -f "${FUNCTION_FILE}" ]]
then
	echo "${FUNCTION_FILE} not found."
    exit 1
fi

# Check if the function already exists
COMMAND_RESPONSE=`aws lambda get-function --function-name ${FUNCTION_NAME} 2>&1`

# Check if the lambda function exists
if [[ ${COMMAND_RESPONSE} =~ "Function not found" ]]
  then
    DEPLOY_TYPE='create'
    echo 'Lambda function does not exists. Going to deploy a new function'
  else
    DEPLOY_TYPE='update'
    echo 'Lambda function exists. Going to update the function'
fi

# create a new zip deployment
echo 'Zipping the lambda folder'
TIMESTAMP=`date +%s`
cd ${FUNCTIONS_FOLDER}
ZIPFILE="${DEPLOYMENTS_FOLDER}guillotine_${TIMESTAMP}.zip"
zip -r ${ZIPFILE} ./

# deploy the function
echo 'Deploying....'
case ${DEPLOY_TYPE} in
  'create')
    aws lambda create-function --function-name ${FUNCTION_NAME} --runtime ${RUNTIME} --role ${ROLE} --handler ${FUNCTION_NAME}.handler --zip-file fileb://${ZIPFILE}
    
  ;;
  
  'update')
    aws lambda update-function-code --function-name ${FUNCTION_NAME} --zip-file fileb://${ZIPFILE}
  
  ;;
esac