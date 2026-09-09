package com.star_track.star_track.starTrack.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.Date;
import java.util.UUID;

/** Stable identity; the submitted details live in immutable ProjectCreate versions. */
@Entity
@Table(name = "project", schema = "startrack", catalog = "starTrack")
@Getter @Setter @NoArgsConstructor
public class Project {
    @Id
    private UUID id;
    @Column(nullable = false)
    private boolean archived;
    @Column(name = "archived_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date archivedAt;
    @Column(name = "archived_by")
    private Long archivedBy;
    @Column(name = "created_by", updatable = false)
    private Long createdBy;
    @Column(name = "created_at", nullable = false, updatable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
}
