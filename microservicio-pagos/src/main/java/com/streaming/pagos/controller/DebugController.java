package com.streaming.pagos.controller;

import org.springframework.web.bind.annotation.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/debug")
public class DebugController {
    private final AtomicLong delayMs = new AtomicLong(0);
    private final AtomicBoolean simulateFailure = new AtomicBoolean(false);
    private final AtomicLong failureUntil = new AtomicLong(0);

    @PostMapping("/simulate-load")
    public String simulateLoad(@RequestParam(defaultValue = "3000") long d,
                               @RequestParam(defaultValue = "30") long s) {
        delayMs.set(d);
        new Thread(() -> { try { Thread.sleep(s * 1000); } catch (InterruptedException e) {} delayMs.set(0); }).start();
        return "{\"status\":\"load_simulated\"}";
    }

    @PostMapping("/simulate-failure")
    public String simulateFailure(@RequestParam(defaultValue = "30") long s) {
        simulateFailure.set(true);
        failureUntil.set(System.currentTimeMillis() + s * 1000);
        new Thread(() -> { try { Thread.sleep(s * 1000); } catch (InterruptedException e) {} simulateFailure.set(false); }).start();
        return "{\"status\":\"failure_simulated\"}";
    }

    @PostMapping("/reset")
    public String reset() { delayMs.set(0); simulateFailure.set(false); failureUntil.set(0); return "{\"status\":\"reset_ok\"}"; }

    public long getDelayMs() { return delayMs.get(); }
    public boolean isFailing() { return simulateFailure.get() && System.currentTimeMillis() < failureUntil.get(); }
}
