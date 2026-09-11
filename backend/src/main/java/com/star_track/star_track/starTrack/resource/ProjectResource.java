package com.star_track.star_track.starTrack.resource;

import com.star_track.star_track.starTrack.dto.*;
import com.star_track.star_track.starTrack.service.ProjectCreateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectResource {
    private final ProjectCreateService service;
    public ProjectResource(ProjectCreateService service) { this.service = service; }

    @GetMapping
    public List<ProjectDataResponse> list() { return service.getProjectCreateManagementDataLatest(); }

    @PostMapping
    public ResponseEntity<ProjectVersionResponse> create(@Valid @RequestBody ProjectCreateDTO body) {
        var version = service.create(body);
        return ResponseEntity.created(URI.create("/api/projects/" + version.getProjectId())).body(service.detail(version));
    }

    @GetMapping("/{projectId}")
    public ProjectVersionResponse current(@PathVariable UUID projectId) { return service.current(projectId); }

    @GetMapping("/{projectId}/versions")
    public List<ProjectVersionResponse> versions(@PathVariable UUID projectId) { return service.versions(projectId); }

    @PostMapping("/{projectId}/versions")
    public ResponseEntity<ProjectVersionResponse> append(@PathVariable UUID projectId, @Valid @RequestBody ProjectCreateDTO body) {
        var version = service.append(projectId, body.getExpectedVersion(), body);
        return ResponseEntity.created(URI.create("/api/projects/" + projectId + "/versions"))
                .body(service.detail(version));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> archive(@PathVariable UUID projectId) {
        service.archive(projectId);
        return ResponseEntity.noContent().build();
    }
}
