package com.streaming.pagos.controller;

import com.streaming.pagos.model.Pago;
import com.streaming.pagos.model.Suscripcion;
import com.streaming.pagos.service.PagosService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pagos")
public class PagosController {

    private final PagosService service;

    public PagosController(PagosService service) { this.service = service; }

    // ─── Suscripciones ───
    @GetMapping("/suscripciones")
    public ResponseEntity<List<Suscripcion>> getAllSuscripciones() { return ResponseEntity.ok(service.findAllSuscripciones()); }

    @GetMapping("/suscripciones/{id}")
    public ResponseEntity<Suscripcion> getSuscripcionById(@PathVariable Long id) {
        return service.findSuscripcionById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/suscripciones/usuario/{usuarioId}")
    public ResponseEntity<List<Suscripcion>> getSuscripcionesByUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.findByUsuarioId(usuarioId));
    }

    @PostMapping("/suscripciones")
    public ResponseEntity<Suscripcion> createSuscripcion(@RequestBody Suscripcion s) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createSuscripcion(s));
    }

    @PutMapping("/suscripciones/{id}")
    public ResponseEntity<Suscripcion> updateSuscripcion(@PathVariable Long id, @RequestBody Suscripcion s) {
        try { return ResponseEntity.ok(service.updateSuscripcion(id, s)); }
        catch (RuntimeException e) { return ResponseEntity.notFound().build(); }
    }

    // ─── Pagos ───
    @GetMapping("/historial")
    public ResponseEntity<List<Pago>> getAllPagos() { return ResponseEntity.ok(service.findAllPagos()); }

    @GetMapping("/historial/usuario/{usuarioId}")
    public ResponseEntity<List<Pago>> getPagosByUsuario(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.findPagosByUsuario(usuarioId));
    }

    @PostMapping("/pagar")
    public ResponseEntity<Pago> createPago(@RequestBody Pago p) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createPago(p));
    }
}
