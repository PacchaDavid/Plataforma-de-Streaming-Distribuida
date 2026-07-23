package com.streaming.recomendaciones.repository;

import com.streaming.recomendaciones.model.Contenido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContenidoRepository extends JpaRepository<Contenido, Long> {
    List<Contenido> findByGenero(String genero);
    List<Contenido> findByTipo(String tipo);
    List<Contenido> findByTituloContainingIgnoreCase(String titulo);
}
