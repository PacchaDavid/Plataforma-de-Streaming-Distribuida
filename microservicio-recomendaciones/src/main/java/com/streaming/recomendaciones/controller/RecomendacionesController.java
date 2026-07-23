package com.streaming.recomendaciones.controller;

import com.streaming.recomendaciones.model.Contenido;
import com.streaming.recomendaciones.model.Recomendacion;
import com.streaming.recomendaciones.service.RecomendacionesService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recomendaciones")
public class RecomendacionesController {

    private final RecomendacionesService service;

    public RecomendacionesController(RecomendacionesService service) { this.service = service; }

    // ─── Catálogo ───
    @GetMapping("/contenido")
    public ResponseEntity<List<Contenido>> getAllContenido() { return ResponseEntity.ok(service.findAllContenido()); }

    @GetMapping("/contenido/{id}")
    public ResponseEntity<Contenido> getContenidoById(@PathVariable Long id) {
        return service.findContenidoById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/contenido/genero/{genero}")
    public ResponseEntity<List<Contenido>> getByGenero(@PathVariable String genero) {
        return ResponseEntity.ok(service.findByGenero(genero));
    }

    @GetMapping("/contenido/tipo/{tipo}")
    public ResponseEntity<List<Contenido>> getByTipo(@PathVariable String tipo) {
        return ResponseEntity.ok(service.findByTipo(tipo));
    }

    @GetMapping("/contenido/buscar")
    public ResponseEntity<List<Contenido>> search(@RequestParam String q) {
        return ResponseEntity.ok(service.search(q));
    }

    @PostMapping("/contenido")
    public ResponseEntity<Contenido> createContenido(@RequestBody Contenido c) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createContenido(c));
    }

    // ─── Recomendaciones personalizadas ───
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Recomendacion>> getRecomendaciones(@PathVariable Long usuarioId) {
        return ResponseEntity.ok(service.findRecomendacionesByUsuario(usuarioId));
    }
}
