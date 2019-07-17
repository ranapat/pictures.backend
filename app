#!/bin/bash

current="$(pwd)/"
desired="$(dirname $0)"
cd $desired
node ./bin/app.js "$@"
cd $current
