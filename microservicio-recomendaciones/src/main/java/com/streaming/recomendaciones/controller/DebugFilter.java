package com.streaming.recomendaciones.controller;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import java.io.IOException;

@Component
public class DebugFilter implements Filter {

    private final DebugController debugController;

    public DebugFilter(DebugController debugController) {
        this.debugController = debugController;
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        String path = ((HttpServletRequest) request).getRequestURI();
        if (path != null && path.startsWith("/debug")) {
            chain.doFilter(request, response);
            return;
        }

        if (debugController.isFailing()) {
            HttpServletResponse resp = (HttpServletResponse) response;
            resp.setStatus(500);
            resp.setContentType("application/json");
            resp.getWriter().write("{\"error\":\"simulated_failure\"}");
            return;
        }

        long delay = debugController.getDelayMs();
        if (delay > 0) {
            try { Thread.sleep(delay); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }

        chain.doFilter(request, response);
    }
}
