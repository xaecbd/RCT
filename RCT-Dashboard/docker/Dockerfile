#####################
#version: RCT 1.0
#describe rct-dashboard
#truman create
#
FROM openjdk:8u181-jdk-alpine3.8
LABEL author="Truman.p.Du"
COPY --from=hengyunabc/arthas:latest /opt/arthas /opt/arthas

ENV BASE_DIR /opt/app/rct/rct-dashboard
WORKDIR ${BASE_DIR}
ENV RCT_NAME RCT-Dashboard
ENV VERSION 2.0.0
RUN curl -fsSL -o ${BASE_DIR}/${RCT_NAME}-${VERSION}-release.tar https://github.com/xaecdb/RCT/archive/${RCT_NAME}-${VERSION}-release.tar && \
    cd ${BASE_DIR} && \
    tar xvf ${RCT_NAME}-${VERSION}-release.tar && \
    rm -rf ${RCT_NAME}-${VERSION}-release.tar
ADD start.sh ${BASE_DIR}
CMD ["sh","start.sh"]