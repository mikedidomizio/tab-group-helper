#!/bin/bash

build() {
    echo 'building react production build'

    rm -rf build/*

    export INLINE_RUNTIME_CHUNK=false
    export GENERATE_SOURCEMAP=false

    npm run prep-publish
    npm run build
}

build