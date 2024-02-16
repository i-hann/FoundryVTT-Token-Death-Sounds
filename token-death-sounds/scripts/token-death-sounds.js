Hooks.on("init", function () {
    console.log("Token DSFX  | Initializing Module: Token Death Sound Effects")

    try {
        // Register the "playlist" setting
        game.settings.register('token-death-sounds', 'playlist-id', {
            name: 'Death Sounds Playlist',
            hint: 'Enter the ID of the playlist to be used for random death sounds',
            scope: 'world',     // "world" = sync to db, "client" = local storage
            config: true,       // false if you dont want it to show in module config
            type: String,       // You want the primitive class, e.g. Number, not the name of the class as a string
            default: "Unknown",
            onChange: value => { // value is the new value of the setting
                console.log("Token DSFX  | Death Sounds Playlist changed to: " + value);
            },
            requiresReload: false, // true if you want to prompt the user to reload
            filePicker: "any"
        });
    } catch (err) {
        console.log("Token DSFX  | ERROR: " + err.message);
    }


});

Hooks.on("ready", async function () {
    console.log("Token DSFX  | Token Death Sound Effects is ready!");

    // Listener for tokens dropping to 0 hp
    Hooks.on("updateActor", async (actor, updateData, diff, id) => {
        try {
            if ((typeof actor.system.attributes.hp.value != 'undefined') && (actor.system.attributes.hp.value < 1)) {
                console.log("Token DSFX  | Would play death sfx because actor.system.attributes.hp = " + actor.system.attributes.hp.value);

                // Get the Death playlist
                const playlistId = await game.settings.get('token-death-sounds', 'playlist-id');

                console.log("Token DSFX  | Would play from Playlist ID: " + playlistId);

                const playlist = await game.playlists.get(playlistId);


                if (playlist) {
                    // Get a random death sound
                    const soundIds = await playlist.sounds.map(sound => sound.id);
                    const soundId = await soundIds[Math.floor(Math.random() * soundIds.length)];
                    const sound = await playlist.sounds.find(s => s.id === soundId);

                    if (sound) {
                        // Play it
                        console.log("Token DSFX  | Playing Sound ID: " + soundId);
                        AudioHelper.play({
                            src: sound.path,
                            volume: 0.5,
                            autoplay: true,
                            loop: false
                        });
                    } else {
                        console.log("Token DSFX  | Sound not found for ID: " + soundId);
                    }
                } else {
                    console.log("Token DSFX  | Playlist not found for ID: " + playlistId);
                }
            }
        } catch (err) {
            console.log("Token DSFX  | ERROR: " + err.message);
        }
    });

});

