package com.streaming.pagos.service;

import com.streaming.pagos.model.Pago;
import com.streaming.pagos.model.Suscripcion;
import com.streaming.pagos.repository.PagoRepository;
import com.streaming.pagos.repository.SuscripcionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PagosService {

    private final SuscripcionRepository suscripcionRepository;
    private final PagoRepository pagoRepository;

    public PagosService(SuscripcionRepository suscripcionRepository, PagoRepository pagoRepository) {
        this.suscripcionRepository = suscripcionRepository;
        this.pagoRepository = pagoRepository;
    }

    // ─── Suscripciones ───
    public List<Suscripcion> findAllSuscripciones() { return suscripcionRepository.findAll(); }
    public Optional<Suscripcion> findSuscripcionById(Long id) { return suscripcionRepository.findById(id); }
    public List<Suscripcion> findByUsuarioId(Long usuarioId) { return suscripcionRepository.findByUsuarioId(usuarioId); }
    public Suscripcion createSuscripcion(Suscripcion s) { s.setId(null); return suscripcionRepository.save(s); }
    public Suscripcion updateSuscripcion(Long id, Suscripcion s) {
        return suscripcionRepository.findById(id).map(existing -> {
            existing.setPlan(s.getPlan());
            existing.setEstado(s.getEstado());
            existing.setFechaFin(s.getFechaFin());
            existing.setMonto(s.getMonto());
            return suscripcionRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Suscripcion no encontrada"));
    }

    // ─── Pagos ───
    public List<Pago> findAllPagos() { return pagoRepository.findAll(); }
    public List<Pago> findPagosByUsuario(Long usuarioId) { return pagoRepository.findByUsuarioId(usuarioId); }
    public Pago createPago(Pago p) { p.setId(null); return pagoRepository.save(p); }
}
