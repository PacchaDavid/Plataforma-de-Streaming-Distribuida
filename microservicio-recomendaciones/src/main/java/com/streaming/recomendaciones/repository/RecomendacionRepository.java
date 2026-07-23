package com.streaming.recomendaciones.repository;

import com.streaming.recomendaciones.model.Recomendacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecomendacionRepository extends JpaRepository<Recomendacion, Long> {
    List<Recomendacion> findByUsuarioId(Long usuarioId);
}
