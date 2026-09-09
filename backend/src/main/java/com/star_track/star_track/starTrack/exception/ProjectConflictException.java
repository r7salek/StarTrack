package com.star_track.star_track.starTrack.exception;

/** Stale version, ambiguous legacy name, or an archived project. No data in message. */
public class ProjectConflictException extends RuntimeException {
    public ProjectConflictException() { super("Project operation conflicts with current state"); }
}
