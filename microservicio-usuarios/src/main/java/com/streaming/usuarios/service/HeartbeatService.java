package com.streaming.usuarios.service;

import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.api.sync.RedisCommands;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Service
public class HeartbeatService {

    @Value("${REDIS_HOST:localhost}")
    private String redisHost;

    @Value("${REDIS_PORT:6379}")
    private int redisPort;

    @Value("${MACHINE_ID:0}")
    private String machineId;

    @Value("${SERVICIO_NOMBRE:usuarios}")
    private String servicioNombre;

    private RedisClient redisClient;
    private StatefulRedisConnection<String, String> connection;
    private RedisCommands<String, String> commands;

    @PostConstruct
    public void init() {
        try {
            redisClient = RedisClient.create("redis://" + redisHost + ":" + redisPort);
            connection = redisClient.connect();
            commands = connection.sync();
            System.out.println("[Heartbeat] Conectado a Redis en " + redisHost + ":" + redisPort);
        } catch (Exception e) {
            System.err.println("[Heartbeat] Error conectando a Redis: " + e.getMessage());
        }
    }

    @Scheduled(fixedRate = 2000)
    public void sendHeartbeat() {
        if (commands == null) return;
        try {
            String channel = "heartbeat:" + machineId + ":" + servicioNombre;
            String payload = "{\"status\":\"UP\",\"servicio\":\"" + servicioNombre + "\",\"machine_id\":\"" + machineId + "\"}";
            commands.publish(channel, payload);
        } catch (Exception e) {
            System.err.println("[Heartbeat] Error publicando heartbeat: " + e.getMessage());
        }
    }

    @PreDestroy
    public void shutdown() {
        if (connection != null) connection.close();
        if (redisClient != null) redisClient.shutdown();
    }
}
