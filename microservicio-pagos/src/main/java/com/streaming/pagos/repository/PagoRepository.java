package com.streaming.pagos.repository;

import com.streaming.pagos.model.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findBySuscripcionId(Long suscripcionId);
    List<Pago> findByUsuarioId(Long usuarioId);
}
