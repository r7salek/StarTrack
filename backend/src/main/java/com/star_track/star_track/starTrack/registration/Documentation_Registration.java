package com.star_track.star_track.starTrack.registration;

public class Documentation_Registration {
    /**
     * Registration module contains all the logic related to authenticate user by using OAUTH data
     * Get values from Client side and send back response for that user
     * Module also control usage of apis only authorize user can use these API for data Processing
     * Main registration module is further divide logically into sub_modules
     *
     * Config sub_module contain the logic of configuration of token auth , properties and Security
     *
     * Controller sub_module contain mapping logic for authentication and for user
     *
     * Dto sub_module is used to define logic for interested data fields values for different purposes
     * Like signup values, login values, local user values etc.
     *
     * exception sub_module are used to define expected exceptions while getting data or sending data through API
     * and User authentication process
     *
     * Security sub_mosule is used to check all the possible cases for security purpose. Like Bear token
     * values. Getting the token values and verification process
     *
     * Service sub_Module are used to define the logic of repository, services and resources logic
     * Create initial user by default, registration process logic and login process logic
     *
     * Util sub_module is used to defined the logic of cookies and general information regarding user
     *
     * password sub_module is used to define the logic of password and match password.
     *
     */
}

