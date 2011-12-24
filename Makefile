SRC_DIR = src
BUILD_DIR = build
LIB_DIR = lib
DIST_DIR = .

JS_ENGINE ?= `which node nodejs`
COMPILER = ${JS_ENGINE} ${BUILD_DIR}/uglify.js --unsafe

BASE_FILES = ${SRC_DIR}/PathSeg.js\
	${SRC_DIR}/DraggableControlPoint.js\
	${SRC_DIR}/SVGPathEditor.js

LIB_FILES = ${LIB_DIR}/ynakajima.core.js

MODULES = COPYRIGHT\
	${LIB_FILES}\
	${BASE_FILES}

SPE = ${DIST_DIR}/SVGPathEditor.js
SPE_MIN = ${DIST_DIR}/SVGPathEditor.min.js


all: core

core: SVGPathEditor min
	@@echo "build complete."

${DIST_DIR}:
	@@mkdir -p ${DIST_DIR}

SVGPathEditor: ${SPE}

${SPE}: ${MODULES} | ${DIST_DIR}
	@@echo "Building" ${SPE}

	@@cat ${MODULES} > ${SPE};

min: SVGPathEditor ${SPE_MIN}

${SPE_MIN}: ${SPE}
	@@if test ! -z ${JS_ENGINE}; then \
		echo "Minifying " ${SPE_MIN}; \
		${COMPILER} ${SPE} > ${SPE_MIN}; \
	else \
		echo "You must have NodeJS installed in order to minify."; \
	fi
	
clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm ${SPE} ${SPE_MIN}

.PHONY: all SVGPathEditor min clean core
