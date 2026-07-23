package com.streaming.recomendaciones.service;

import com.streaming.recomendaciones.model.Contenido;
import com.streaming.recomendaciones.model.Recomendacion;
import com.streaming.recomendaciones.repository.ContenidoRepository;
import com.streaming.recomendaciones.repository.RecomendacionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RecomendacionesService {

    private final ContenidoRepository contenidoRepository;
    private final RecomendacionRepository recomendacionRepository;

    public RecomendacionesService(ContenidoRepository contenidoRepository,
                                  RecomendacionRepository recomendacionRepository) {
        this.contenidoRepository = contenidoRepository;
        this.recomendacionRepository = recomendacionRepository;
    }

    // ─── Contenido ───
    public List<Contenido> findAllContenido() { return contenidoRepository.findAll(); }
    public Optional<Contenido> findContenidoById(Long id) { return contenidoRepository.findById(id); }
    public List<Contenido> findByGenero(String genero) { return contenidoRepository.findByGenero(genero); }
    public List<Contenido> findByTipo(String tipo) { return contenidoRepository.findByTipo(tipo); }
    public List<Contenido> search(String q) { return contenidoRepository.findByTituloContainingIgnoreCase(q); }
    public Contenido createContenido(Contenido c) { c.setId(null); return contenidoRepository.save(c); }

    // ─── Recomendaciones ───
    public List<Recomendacion> findRecomendacionesByUsuario(Long usuarioId) {
        return recomendacionRepository.findByUsuarioId(usuarioId);
    }
    public Recomendacion createRecomendacion(Recomendacion r) { r.setId(null); return recomendacionRepository.save(r); }
}
