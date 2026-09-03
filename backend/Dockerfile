FROM maven:3.9.9-eclipse-temurin-11 AS build

WORKDIR /workspace
COPY pom.xml ./
RUN mvn --batch-mode --no-transfer-progress -DskipTests dependency:go-offline

COPY src ./src
RUN mvn --batch-mode --no-transfer-progress -DskipTests package

FROM eclipse-temurin:11-jre-jammy

WORKDIR /app
COPY --from=build /workspace/target/backend.war ./backend.war

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/backend.war"]
