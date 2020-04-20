#!/bin/bash

FUNCTION_NAME=$1 # get the function name from the first argument
FUNCTIONS_FOLDER="/home/ec2-user/environment/guillotine/lambda/"
DEPLOYMENTS_FOLDER="/home/ec2-user/environment/guillotine/deployments/"
RUNTIME="nodejs12.x"
ROLE="arn:aws:iam::288504654618:role/Guillotine_Lambda_Execution_Role"
ENVIRONMENT_VARIABLES='{CONNECTION_TABLE=WS-Connections}'
HANDLER="guillotine-handler"
FUNCTIONS=("guillotine-game" "guillotine-player")


# Check if an argument of the function name been set as argument
# if [ -z "${FUNCTION_NAME}" ]
#   then
#     echo "No argument supplied"
#     exit 1
#   else
#     FUNCTION_FILE="${FUNCTIONS_FOLDER}${HANDLER}.js"
# fi

# # Check if the handler function file exists
# if [[ ! -f "${FUNCTION_FILE}" ]]
# then
# 	echo "${FUNCTION_FILE} not found."
#     exit 1
# fi



function deploy_lambda() {
  FUNCTION_NAME=$1
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
  
  case ${DEPLOY_TYPE} in
  'create')
    aws lambda create-function --function-name ${FUNCTION_NAME} \
    --runtime ${RUNTIME} --role ${ROLE} \
    --handler ${FUNCTION_NAME}.handler \
    --zip-file fileb://${ZIPFILE} \
    --environment Variables=${ENVIRONMENT_VARIABLES}
    
  ;;
  
  'update')
    aws lambda update-function-code --function-name ${FUNCTION_NAME} \
    --zip-file fileb://${ZIPFILE}
  
  ;;
esac
}

# install the required dependencies
cd ${FUNCTIONS_FOLDER}
npm install

# create a new zip deployment
echo 'Zipping the lambda folder'
TIMESTAMP=`date +%s`
ZIPFILE="${DEPLOYMENTS_FOLDER}guillotine_${TIMESTAMP}.zip"
zip -r ${ZIPFILE} ./

# deploy the function
echo 'Deploying....'
for f in ${FUNCTIONS[@]}; do
  deploy_lambda ${f}
done
