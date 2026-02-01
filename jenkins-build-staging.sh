#!/bin/bash

export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/
export PATH="$JAVA_HOME/bin:$PATH"
mkdir -p /home/ubuntu/jar_files/titan-backend/$branch
echo "Building Common utils services - Started"
cd DeliveryExecutiveWebApp/commons-utilities
JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
echo "Building Common utils services - Ended"
IFS=',' read -ra SERVICES <<< "$SERVICE_NAME"   # Split comma-separated values into an array

for SERVICE in "${SERVICES[@]}"; do
    if [ "$SERVICE" == "ALL" ]; then
        echo "Building all services"
        cd /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/
        JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install -Dmaven.test.skip=true
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/service-registry/target/service-registry-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/authentication/target/authentication-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/user-service/target/user-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/organisation-service/target/organisation-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/reports-service/target/reports-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/cloud-gateway/target/cloud-gateway-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/transaction-service/target/transaction-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/helix-service/target/helix-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/communication-service/target/communication-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/communication-client/target/communication-client-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/academy-service/target/academy-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
        break   # Exit the loop if SERVICE_NAME is ALL
    else
        echo "Building service: $SERVICE"
        cd /var/lib/jenkins/workspace/build_backend_titan_staging/
        if [ "$SERVICE" == "CLOUD_GATEWAY" ]; then
            echo "Building CLOUD_GATEWAY service - Started"
            cd DeliveryExecutiveWebApp/cloud-gateway
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/cloud-gateway/target/cloud-gateway-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building CLOUD_GATEWAY service - Ended"
        fi
        if [ "$SERVICE" == "AUTH_SERVICE" ]; then
            echo "Building AUTH_SERVICE service - Started"
            cd DeliveryExecutiveWebApp/authentication
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/authentication/target/authentication-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building AUTH_SERVICE service - Ended"
        fi
        if [ "$SERVICE" == "ORG_SERVICE" ]; then
            echo "Building ORG_SERVICE service - Started"
            cd DeliveryExecutiveWebApp/organisation-service
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/organisation-service/target/organisation-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building ORG_SERVICE service - Ended"
        fi
        if [ "$SERVICE" == "REPORT_SERVICE" ]; then
            echo "Building REPORT_SERVICE service - Started"
            cd DeliveryExecutiveWebApp/reports-service
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/reports-service/target/reports-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building REPORT_SERVICE service - Ended"
        fi
        if [ "$SERVICE" == "SERVICE_REG" ]; then
            echo "Building SERVICE_REG service - Started"
            cd DeliveryExecutiveWebApp/service-registry
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/service-registry/target/service-registry-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building SERVICE_REG service - Ended"
        fi
        if [ "$SERVICE" == "TRANSACTIONAL_SERVICE" ]; then
            echo "Building TRANSACTIONAL_SERVICE service - Started"
            cd DeliveryExecutiveWebApp/transaction-service
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/transaction-service/target/transaction-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building TRANSACTIONAL_SERVICE service - Ended"
        fi
        if [ "$SERVICE" == "HELIX_SERVICE" ]; then
            echo "Building HELIX_SERVICE service - Started"
            cd DeliveryExecutiveWebApp/helix-service
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/helix-service/target/helix-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building HELIX_SERVICE service - Ended"
        fi
        if [ "$SERVICE" == "USER_SERVICE" ]; then
            echo "Building USER_SERVICE service - Started"
            cd DeliveryExecutiveWebApp/user-service
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/user-service/target/user-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building USER_SERVICE service - Ended"
        fi
        if [ "$SERVICE" == "COMM_CLIENT" ]; then
            echo "Building COMM_CLIENT service - Started"
            cd DeliveryExecutiveWebApp/communication-client
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/communication-client/target/communication-client-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building COMM_CLIENT service - Ended"
        fi
        if [ "$SERVICE" == "COMM_SERVICE" ]; then
            echo "Building COMM_SERVICE service - Started"
            cd DeliveryExecutiveWebApp/communication-service
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/communication-service/target/communication-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building COMM_SERVICE service - Ended"
        fi
        if [ "$SERVICE" == "ACADEMY_SERVICE" ]; then
            echo "Building ACADEMY_SERVICE service - Started"
            cd DeliveryExecutiveWebApp/academy-service
            JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64/ /usr/local/apache-maven/apache-maven-3.8.6/bin/mvn -Dmaven.compiler.executable=/usr/lib/jvm/java-16-amazon-corretto/bin/javac -U clean install
            cp /var/lib/jenkins/workspace/build_backend_titan_staging/DeliveryExecutiveWebApp/academy-service/target/academy-service-0.0.1-SNAPSHOT.jar /home/ubuntu/jar_files/titan-backend/$branch/
            echo "Building ACADEMY_SERVICE service - Ended"
        fi
    fi
done

cd /home/ubuntu/jar_files/titan-backend/$branch/
aws s3 sync . s3://lsn-artifactory/titan-backend-staging/$branch/


ssh -T ubuntu@3.7.170.210 << EOF
sudo sh deployStaging.sh
EOF
