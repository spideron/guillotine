#!/bin/bash

REACT_FOLDER="/home/ec2-user/environment/guillotine/guillotine-react/"
WEBSITE_FOLDER="${REACT_FOLDER}build"
S3_LOCATION="s3://itzik-games-guillotine/"

# build the website
cd ${REACT_FOLDER}
npm run build

# sync the website to s3
cd ${WEBSITE_FOLDER}
aws s3 sync ./ ${S3_LOCATION}