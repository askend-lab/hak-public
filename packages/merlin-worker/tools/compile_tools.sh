#!/bin/bash

#########################################
######### Compile Tools (no downloads) ##
#########################################

tools_dir=$(dirname $0)
cd $tools_dir

# 1. Compile SPTK (source already in repo)
if [ -d "SPTK-3.9" ]; then
    echo "compiling SPTK..."
    (
        cd SPTK-3.9;
        ./configure --prefix=$PWD/build;
        make;
        make install
    )
else
    echo "ERROR: SPTK-3.9 source not found!"
    exit 1
fi



# 2. Compile WORLD (source already in repo)
if [ -d "WORLD" ]; then
    echo "compiling WORLD..."
    (
        cd WORLD;
        make
        make analysis synth
        make clean
    )
else
    echo "ERROR: WORLD source not found!"
    exit 1
fi

# 3. Compile genlab (source already in repo)
if [ -d "genlab" ]; then
    echo "compiling genlab..."
    (
        cd genlab;
        ./configure CC=/usr/bin/gcc CXX=/usr/bin/g++ CFLAGS="-g3 -gdwarf-2" CXXFLAGS="-g3 -gdwarf-2"
        test -x configure || autoreconf -vif        
        make
    )
else
    echo "ERROR: genlab source not found!"
    exit 1
fi




SPTK_BIN_DIR=bin/SPTK-3.9
WORLD_BIN_DIR=bin/WORLD


# 4. Copy binaries to bin/



mkdir -p bin
mkdir -p $SPTK_BIN_DIR
mkdir -p $WORLD_BIN_DIR

cp SPTK-3.9/build/bin/* $SPTK_BIN_DIR/
cp WORLD/build/analysis $WORLD_BIN_DIR/
cp WORLD/build/synth $WORLD_BIN_DIR/

if [[ ! -f ${SPTK_BIN_DIR}/x2x ]]; then
    echo "Error installing SPTK tools! Try installing dependencies!!"
    echo "sudo apt-get install csh"
    exit 1
elif [[ ! -f ${WORLD_BIN_DIR}/analysis ]]; then
    echo "Error installing WORLD tools"
    exit 1
else
    echo "All tools successfully compiled!!"
fi
