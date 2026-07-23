package com.streaming.usuarios.service;

import com.streaming.usuarios.model.Usuario;
import com.streaming.usuarios.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsuarioService {

    private final UsuarioRepository repository;

    public UsuarioService(UsuarioRepository repository) {
        this.repository = repository;
    }

    public List<Usuario> findAll() {
        return repository.findAll();
    }

    public Optional<Usuario> findById(Long id) {
        return repository.findById(id);
    }

    public Optional<Usuario> findByEmail(String email) {
        return repository.findByEmail(email);
    }

    public Usuario create(Usuario usuario) {
        usuario.setId(null);
        return repository.save(usuario);
    }

    public Usuario update(Long id, Usuario usuario) {
        return repository.findById(id).map(existing -> {
            existing.setNombre(usuario.getNombre());
            existing.setEmail(usuario.getEmail());
            existing.setPerfil(usuario.getPerfil());
            if (usuario.getPassword() != null && !usuario.getPassword().isEmpty()) {
                existing.setPassword(usuario.getPassword());
            }
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + id));
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
