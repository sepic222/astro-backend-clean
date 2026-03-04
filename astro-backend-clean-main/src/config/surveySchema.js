// AUTO-GENERATED FILE. DO NOT EDIT.
// Synced from fateflix-frontend/src/config/surveyData.js
// Run "npm run sync-schema" to update.

module.exports.surveySchema = [
  {
    "id": "intro-hero",
    "title": "",
    "questions": [
      {
        "id": "start_hero",
        "type": "hero_start"
      }
    ]
  },
  {
    "id": "astro-data",
    "title": "Your Cosmic Identity",
    "questions": [
      {
        "id": "username",
        "type": "text",
        "text": "What name should we call you in the credits?"
      },
      {
        "id": "email",
        "type": "email",
        "text": "We need your email to send your astro-cinematic gift. 💫(Required)"
      },
      {
        "id": "date",
        "type": "date",
        "text": "Birth Date"
      },
      {
        "id": "time",
        "type": "time",
        "text": "Birth Time"
      },
      {
        "id": "time_accuracy",
        "type": "radio",
        "text": "The Accuracy of your time of birth?",
        "options": [
          {
            "value": "exact",
            "label": "Exact time (you legend) ⭐"
          },
          {
            "value": "approx_early",
            "label": "Approximate: In the early hours of the morning"
          },
          {
            "value": "approx_morning",
            "label": "Approximate: Morning"
          },
          {
            "value": "approx_midday",
            "label": "Approximate: Midday"
          },
          {
            "value": "approx_afternoon",
            "label": "Approximate: Afternoon"
          },
          {
            "value": "approx_night",
            "label": "Approximate: Night"
          },
          {
            "value": "unknown",
            "label": "🤷 I have no idea (still works, but a bit more vague)"
          }
        ]
      },
      {
        "id": "city",
        "type": "text",
        "text": "Birth City"
      },
      {
        "id": "latitude",
        "type": "number",
        "text": "Latitude"
      },
      {
        "id": "longitude",
        "type": "number",
        "text": "Longitude"
      }
    ]
  },
  {
    "id": "section-ii",
    "title": "Attraction & Self-Casting",
    "questions": [
      {
        "id": "gender",
        "type": "radio",
        "text": "Your Gender",
        "options": [
          {
            "value": "male",
            "label": "Male"
          },
          {
            "value": "female",
            "label": "Female"
          },
          {
            "value": "non_binary",
            "label": "Non-binary"
          },
          {
            "value": "trans",
            "label": "Trans / Gender-expansive"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "attraction_style",
        "type": "radio",
        "text": "What's your attraction style or sexuality vibe?",
        "options": [
          {
            "value": "queer",
            "label": "🌈 Queer and thriving"
          },
          {
            "value": "men",
            "label": "💋 Attracted to men"
          },
          {
            "value": "women",
            "label": "💅 Attracted to women"
          },
          {
            "value": "spectrum",
            "label": "💞 I love across the spectrum"
          },
          {
            "value": "bi_pan",
            "label": "🌪 Bi/Pan/Switch energy"
          },
          {
            "value": "demi_sapio",
            "label": "👁️ Demisexual / Sapiosexual"
          },
          {
            "value": "asexual",
            "label": "🧊 Asexual / No thanks, I'm here for plot"
          },
          {
            "value": "figuring_out",
            "label": "🤷‍♀️ Still figuring it out"
          },
          {
            "value": "steamy_any",
            "label": "🔥 I love anything steamy, no matter the form"
          },
          {
            "value": "no_label",
            "label": "🌀 I don't label it"
          },
          {
            "value": "none",
            "label": "🧬 None of the above — I’ll define it"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "cine_level",
        "type": "checkbox",
        "text": "Where would you place yourself on the Movie Love-o-Meter?",
        "options": [
          {
            "value": "cinephile",
            "label": "Cinephile Supreme (Raised at Blockbuster, evolved on MUBI)"
          },
          {
            "value": "lover",
            "label": "Movie Lover (I've got favourites, I notice good dialogue and cool visuals)"
          },
          {
            "value": "time_poor",
            "label": "Time-Poor Watcher (I watch when I can, sometimes fall asleep)"
          },
          {
            "value": "streaming_vortex",
            "label": "Streaming Vortex (I consume it all, good, bad, trashy)"
          },
          {
            "value": "popcorn",
            "label": "Popcorn-Only Viewer (I go to the cinema for explosions and hot cast)"
          },
          {
            "value": "sleepy",
            "label": "Sleepy Streamer (Background noise to fall asleep)"
          },
          {
            "value": "recovering",
            "label": "Recovering Binger (I finish even the worst series. HELP!))"
          },
          {
            "value": "scroller",
            "label": "Lost in the Scroll (45 mins scrolling, watch nothing, scroll socials)"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "life_role",
        "type": "radio",
        "text": "In the movie of your life... what role do you play?",
        "options": [
          {
            "value": "rescuer",
            "label": "The Rescuer (Help, save, protect, fix)"
          },
          {
            "value": "disruptor",
            "label": "The Chaotic Disruptor (I stir the plot)"
          },
          {
            "value": "outsider",
            "label": "The Dreamy Outsider (Out of step, deeply in tune)"
          },
          {
            "value": "overachiever",
            "label": "The Overachiever (I carry the expectations and I deliver)"
          },
          {
            "value": "observer",
            "label": "The Mysterious Observer"
          },
          {
            "value": "ride_or_die",
            "label": "The Ride-or-Die (Loyal, fierce)"
          },
          {
            "value": "comic",
            "label": "The Comic Relief (I lighten the mood when it gets too heavy)"
          },
          {
            "value": "wanderer",
            "label": "The Wanderer (Never rooted)"
          },
          {
            "value": "mirror",
            "label": "The Mirror (I become who people need me to be)"
          },
          {
            "value": "audience",
            "label": "Just here for the popcorn (Audience vibes)"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "escapism_style",
        "type": "checkbox",
        "text": "Your Emotional Escapism Style?",
        "options": [
          {
            "value": "heartbreak",
            "label": "💔 Heartbreak Healer (for breakups, grief, or emotional longing survival)"
          },
          {
            "value": "hangover",
            "label": "😵 Hangover Hero (gentle recovery when I’m fragile)"
          },
          {
            "value": "floodgate",
            "label": "😭 Emotional Floodgate (I want to cry/release)"
          },
          {
            "value": "analyzer",
            "label": "🧐 Chaos Analyzer (Process life through movies)"
          },
          {
            "value": "cozy",
            "label": "🧸 Cozy Comedown (safety, warmth, emotional blankets)"
          },
          {
            "value": "creative",
            "label": "🎨 Creative Kickstart (Spark ideas/ambition)"
          },
          {
            "value": "romance",
            "label": "💘 Romance Igniter (Butterflies, chemistry, connection)"
          },
          {
            "value": "distraction",
            "label": "🙈 Emotional Distraction (Laugh, forget, disassociate)"
          },
          {
            "value": "meaning",
            "label": "🌌 Meaning Maker (Movies help me frame my life story)"
          },
          {
            "value": "romanticizer",
            "label": "🍷 Life Romanticizer (Make pain cinematic)"
          },
          {
            "value": "beauty",
            "label": "✨ Beauty Seeker (Vibes & aesthetics over story)"
          },
          {
            "value": "control",
            "label": "🎮 Control Watcher (when life is chaos, at least I choose the movie)"
          },
          {
            "value": "decoder",
            "label": "🔍 People Decoder (I study characters to understand psychology + relationships)"
          },
          {
            "value": "offline",
            "label": "🔌 Emotionally Offline (Don't feel them emotionally)"
          },
          {
            "value": "ambience",
            "label": "🛋️ Ambience-Only Watcher (Background energy not a full experience)"
          },
          {
            "value": "other",
            "label": "✨ Other"
          }
        ]
      },
      {
        "id": "top_3_movies",
        "type": "textarea",
        "text": "🍿 Drop your all-time TOP 3 Movies, Series or Docs"
      },
      {
        "id": "first_fascination✨",
        "type": "textarea",
        "text": "Who or what were you first fascinated by on screen? ✨"
      }
    ]
  },
  {
    "id": "section-iii",
    "title": "Cinematic Taste",
    "questions": [
      {
        "id": "watch_habit",
        "type": "checkbox",
        "text": "How do you watch most of the time?",
        "options": [
          {
            "value": "solo",
            "label": "Alone, in full control"
          },
          {
            "value": "partner",
            "label": "With a partner (we negotiate)"
          },
          {
            "value": "friends",
            "label": "With friends (it's an experience)"
          },
          {
            "value": "late_night",
            "label": "Late at night (emotionally open)"
          },
          {
            "value": "weekends",
            "label": "Only on weekends (ritual)"
          },
          {
            "value": "multitask",
            "label": "While multitasking (background mode)"
          },
          {
            "value": "transit",
            "label": "On phone/tablet in transit"
          },
          {
            "value": "bed",
            "label": "In bed, to fall asleep"
          },
          {
            "value": "binge",
            "label": "I binge no matter who's around"
          },
          {
            "value": "scroll",
            "label": "I scroll forever, watch nothing"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "fav_era",
        "type": "checkbox",
        "text": "What's your favourite movie era?",
        "options": [
          {
            "value": "silent",
            "label": "Silent Era - Visual storytelling before sound"
          },
          {
            "value": "1930s",
            "label": "1930s - Hollywood fantasy during hard times"
          },
          {
            "value": "1940s",
            "label": "1940s - Shadows, Smoke & Suspense"
          },
          {
            "value": "1950s",
            "label": "1950s - Studio Magic & Technicolor"
          },
          {
            "value": "1960s",
            "label": "1960s - Revolution, Nouvelle Vague & Cool Chaos"
          },
          {
            "value": "1970s",
            "label": "1970s - Grit, Glam & Auteur Uprising"
          },
          {
            "value": "1980s",
            "label": "1980s - Neon, Synths & Shoulder Pads"
          },
          {
            "value": "1990s",
            "label": "1990s - Indie Boom & VHS Royalty"
          },
          {
            "value": "2000s",
            "label": "2000s - Tumblr-core & Teen Dreams"
          },
          {
            "value": "post2010",
            "label": "Post-2010 - A24 & Softcore Apocalypse"
          },
          {
            "value": "streaming",
            "label": "Streaming Era - Prestige TV & Cultural Moments"
          },
          {
            "value": "fluid",
            "label": "Era-fluid: Time is fake."
          }
        ]
      },
      {
        "id": "culture_background",
        "type": "textarea",
        "text": "🌍 Where did you grow up (or feel culturally shaped by)?\nCulture > Passport\nWhere did your movie, media, and series worldview come from?"
      },
      {
        "id": "environment_growing_up",
        "type": "checkbox",
        "text": "What kind of environment did you grow up in?",
        "options": [
          {
            "value": "eclectic",
            "label": "🌍 Globally curious / culturally eclectic"
          },
          {
            "value": "traditional",
            "label": "🏡 Traditional / locally rooted"
          },
          {
            "value": "internet",
            "label": "💻 Internet-raised (Tumblr, YouTube)"
          },
          {
            "value": "religious",
            "label": "🙏 Religious or values-based"
          },
          {
            "value": "artistic",
            "label": "🎨 Artistic / progressive / liberal"
          },
          {
            "value": "disruptor",
            "label": "⚡ I was the cultural disruptor"
          },
          {
            "value": "quiet",
            "label": "🤫 Quiet, minimal, or emotionally closed"
          },
          {
            "value": "moving",
            "label": "🧳 Always moving / never settled"
          },
          {
            "value": "other",
            "label": "✨ Other"
          }
        ]
      }
    ]
  },
  {
    "id": "section-iv",
    "title": "Cinematic Core Memories",
    "questions": [
      {
        "id": "first_feeling",
        "type": "textarea",
        "text": "What's the first movie that ever made you feel something?"
      },
      {
        "id": "life_changing",
        "type": "textarea",
        "text": "What film has left a lasting impact on you — or shaped who you are at a pivotal moment"
      },
      {
        "id": "comfort_watch",
        "type": "text",
        "text": "Your Ultimate Comfort Watch?"
      },
      {
        "id": "power_watch",
        "type": "textarea",
        "text": "Is there a film that genuinely shifted something in you? Could be a turning point, a breakup companion, a film you return to when you need to feel like yourself again."
      },
      {
        "id": "date_impress",
        "type": "text",
        "text": "What movie do you drop to impress a date / crush / dinner guest?"
      }
    ]
  },
  {
    "id": "section-v",
    "title": "Cosmic Worldbuilding & Desire",
    "questions": [
      {
        "id": "movie_universe",
        "type": "checkbox",
        "text": "If you could live inside any movie universe... which one(s) would you pick?",
        "options": [
          {
            "value": "magical",
            "label": "Magical worlds (Harry Potter, LOTR)"
          },
          {
            "value": "scifi",
            "label": "Sci-Fi realms (Blade Runner, Star Wars)"
          },
          {
            "value": "aesthetic",
            "label": "Aesthetic dreamlands (Barbie, Wes Anderson)"
          },
          {
            "value": "romantic",
            "label": "Romantic escapes (Call Me by Your Name)"
          },
          {
            "value": "dystopia",
            "label": "Futuristic dystopias (Her, Gattaca)"
          },
          {
            "value": "surreal",
            "label": "Trippy surrealism (Spirited Away, Inception)"
          },
          {
            "value": "melancholia",
            "label": "Cool melancholia (Lost in Translation)"
          },
          {
            "value": "nature",
            "label": "Nature & nostalgia (Totoro, Little Women)"
          },
          {
            "value": "glamour",
            "label": "Theatre and glamour (Moulin Rouge, Cabaret)"
          },
          {
            "value": "thrilling",
            "label": "Dangerously thrilling (John Wick, Kill Bill)"
          },
          {
            "value": "old_world",
            "label": "Old world elegance (The Age of Innocence, A Room with a View)"
          },
          {
            "value": "gothic",
            "label": "Gothic and strange (Pan's Labyrinth)"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "villain_relate",
        "type": "textarea",
        "text": "Who's your on-screen alter ego or the villain you secretly relate to? And... why?⭐"
      },
      {
        "id": "forever_crush",
        "type": "textarea",
        "text": "Who's your forever on-screen crush?💘"
      },
      {
        "id": "crave_most",
        "type": "checkbox",
        "text": "What do you crave most in a movie?",
        "options": [
          {
            "value": "emotional",
            "label": "🥀 Soft, sad & deeply felt"
          },
          {
            "value": "tension",
            "label": "⚡ High stakes & tension (suspense, danger, edge-of-seat energy)"
          },
          {
            "value": "chaos",
            "label": "🌪️ Emotional chaos & catharsis (rage, release, revenge acts)"
          },
          {
            "value": "clever",
            "label": "🧩 Clever & conceptual (symbolism, sharp dialogue, plot twists)"
          },
          {
            "value": "structure",
            "label": "📐 Satisfying structure (I care about the plot)"
          },
          {
            "value": "poetic",
            "label": "🌌 Philosophical & poetic (existential & reflective)"
          },
          {
            "value": "political_social",
            "label": "✊ Politically conscious, socially relevant"
          },
          {
            "value": "depth",
            "label": "🧿 Characters with depth (inner worlds & transformation)"
          },
          {
            "value": "performance",
            "label": "🎭 Haunting performances"
          },
          {
            "value": "chemistry",
            "label": "🍷 Sexy, slow chemistry (glances > gestures > tension)"
          },
          {
            "value": "stylish",
            "label": "✨ Cool & stylish (mood, music, fashion)"
          },
          {
            "value": "escapism",
            "label": "🧸 Wholesome escapism (comfort, nostalgia & happy endings)"
          },
          {
            "value": "immersive",
            "label": "🏰 Immersive Worlds (I want to live inside)"
          },
          {
            "value": "fun",
            "label": "🍿 Fun, clever & quotable (rewatch energy)"
          },
          {
            "value": "trippy",
            "label": "🍄 Weird & trippy (surrealism is truth)"
          },
          {
            "value": "dark",
            "label": "🌑 Dark & seductive (noir, danger, desire)"
          },
          {
            "value": "crime",
            "label": "💰 Crime, hustle & heist"
          },
          {
            "value": "adrenaline",
            "label": "💥 Pure adrenaline (chase scenes, explosions, velocity)"
          },
          {
            "value": "not_basic",
            "label": "💎 Whatever makes my life feel less basic for 90 minutes"
          },
          {
            "value": "other",
            "label": "✨ Other"
          }
        ]
      }
    ]
  },
  {
    "id": "section-vi",
    "title": "Screen Education: What Trained Your Taste 📺",
    "questions": [
      {
        "id": "tv_taste",
        "type": "checkbox",
        "text": "TV Taste Check: Pick the flavours that feed your soul.",
        "options": [
          {
            "value": "movie_only",
            "label": "I’m movie-only. TV isn’t really my thing"
          },
          {
            "value": "avoid_series",
            "label": "I avoid series, I get addicted 😅"
          },
          {
            "value": "prestige",
            "label": "Slow-burn prestige (long arcs, power, HBO-core)"
          },
          {
            "value": "dark_drama",
            "label": "Dark Drama (crime, revenge, moral mess)"
          },
          {
            "value": "reality",
            "label": "Reality chaos (Love Island, Housewives, Kardashians)"
          },
          {
            "value": "comedy",
            "label": "Comfort comedy (sitcoms, rewatch therapy)"
          },
          {
            "value": "talk_shows",
            "label": "Talk shows & panel shows (late night, interviews, comedians)"
          },
          {
            "value": "animated",
            "label": "Animated brilliance (BoJack, anime, adult animation)"
          },
          {
            "value": "limited",
            "label": "Limited series / anthologies (intense contained stories)"
          },
          {
            "value": "retro",
            "label": "Retro magic (Twin Peaks, Golden Girls, 90s teen shows)"
          },
          {
            "value": "scifi_fantasy",
            "label": "Sci-fi & fantasy worlds (myth & alternate realties)"
          },
          {
            "value": "documentaries",
            "label": "Documentaries & real stories (true crime, pop culture, sport)"
          },
          {
            "value": "factual",
            "label": "Factual entertainment & curiosity TV (Discovery, Nat Geo, science, nature)"
          },
          {
            "value": "cooking",
            "label": "Cooking & food shows"
          },
          {
            "value": "sports",
            "label": "Sports Competitions (matches, leagues, tournaments)"
          },
          {
            "value": "talent",
            "label": "Talent & performance shows (singing, dancing)"
          },
          {
            "value": "lifestyle",
            "label": "Lifestyle & background TV"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "top_3_series_detailed",
        "type": "textarea",
        "text": "What are your three favorite 3 series or tv shows of all time?🍿"
      },
      {
        "id": "guilty_pleasure",
        "type": "textarea",
        "text": "What are your ultimate Film or TV guilty pleasures?"
      }
    ]
  },
  {
    "id": "section-vii",
    "title": "Genres & Turn-offs",
    "questions": [
      {
        "id": "genres_love",
        "type": "checkbox",
        "text": "Genres you never get sick of 🍿:",
        "options": [
          {
            "value": "romance",
            "label": "💘 Romance & Rom-Coms"
          },
          {
            "value": "drama",
            "label": "🎭 Drama/Emotional Stories"
          },
          {
            "value": "comedy",
            "label": "😂 Comedy (light or dark)"
          },
          {
            "value": "action",
            "label": "💥 Action/ Adventure"
          },
          {
            "value": "thriller",
            "label": "🔪 Thrillers & Suspense"
          },
          {
            "value": "horror",
            "label": "🩸 Horror (from elevated to slasher)"
          },
          {
            "value": "scifi_fantasy",
            "label": "👽 Sci-Fi, Fantasy & Myth"
          },
          {
            "value": "anime",
            "label": "🗾 Anime & hyper-stylized"
          },
          {
            "value": "indie",
            "label": "🚬 Indie, Arthouse & Cult"
          },
          {
            "value": "musical",
            "label": "💃 Music, Dance & Performance"
          },
          {
            "value": "sports",
            "label": "🥊 Sports & Underdog Stories"
          },
          {
            "value": "biopic",
            "label": "📜 Biopics & True Stories"
          },
          {
            "value": "documentary",
            "label": "📹 Documentary & Real Life Stories"
          },
          {
            "value": "queer",
            "label": "🏳️‍🌈 Queer Cinema & LGBTQ+ Stories"
          },
          {
            "value": "historical",
            "label": "🏰 Historical & Period"
          },
          {
            "value": "trash_reality",
            "label": "🗑️ Trash TV/ Reality Gold"
          },
          {
            "value": "classics",
            "label": "🎞️ Classics & Black&White"
          },
          {
            "value": "westerns",
            "label": "🤠 Westerns & Frontier Epics"
          },
          {
            "value": "genre_fluid",
            "label": "🌊 I’m genre-fluid"
          },
          {
            "value": "other",
            "label": "✨ Other"
          }
        ]
      },
      {
        "id": "turn_offs",
        "type": "checkbox",
        "text": "What do you NOT vibe with on screen?🚩 ",
        "options": [
          {
            "value": "sad",
            "label": "No sad endings, please. Life is hard enough."
          },
          {
            "value": "romcom_cringe",
            "label": "Rom-com sceptic. I'm a realist."
          },
          {
            "value": "scary",
            "label": "I don't do scary."
          },
          {
            "value": "sexual",
            "label": "Too steamy. Here for plot not pelvis."
          },
          {
            "value": "gore",
            "label": "Excessive gore or violence. I’m out."
          },
          {
            "value": "snobbery",
            "label": "Prestige snobbery. Award-bait that takes life too seriously."
          },
          {
            "value": "no_romance",
            "label": "No romance, at all. I need at least one make-out scene."
          },
          {
            "value": "scifi_fantasy",
            "label": "Sci-fi / fantasy. Not my universe."
          },
          {
            "value": "weird_sex",
            "label": "Erotic + weird. Not trying to relive a fever dream from a Berlin sex club."
          },
          {
            "value": "clowns",
            "label": "Clowns, absolutely not. Not even in an arthouse film."
          },
          {
            "value": "reality_tv",
            "label": "Love Island, Housewives, Kardashians, hard pass. I want film, not filler."
          },
          {
            "value": "subtitles",
            "label": "Subtitles. If it’s not in my language, I’m unlikely to watch it."
          },
          {
            "value": "marvel",
            "label": "I don't do Marvel. Not catching that cultural virus."
          },
          {
            "value": "creepy_dolls",
            "label": "Creepy kids or haunted toys. Demons, dolls, no thanks."
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "hated_film",
        "type": "textarea",
        "text": "What's a film everyone else loved... but you hated? Tell us why."
      },
      {
        "id": "hype_style",
        "type": "checkbox",
        "text": "Hype Tracker or Timeless Watcher?",
        "options": [
          {
            "value": "drops",
            "label": "I watch everything the moment it drops."
          },
          {
            "value": "resist",
            "label": "I resist it until it really blows up"
          },
          {
            "value": "crush",
            "label": "Only if my crush is in it"
          },
          {
            "value": "pretend",
            "label": "I pretend not to care, but I watch everything"
          },
          {
            "value": "wait",
            "label": "I wait 5 years and watch it when no one cares"
          },
          {
            "value": "cult",
            "label": "Cult Classics over hype, always"
          },
          {
            "value": "rare",
            "label": "I like rare finds no one's heard of"
          },
          {
            "value": "right_time",
            "label": "The right movie finds me when I need it, not when it's trending"
          },
          {
            "value": "both",
            "label": "Honestly? Both. If it hits, it hits."
          }
        ]
      }
    ]
  },
  {
    "id": "section-viii-deep-dive",
    "title": "🎬 🌍 Optional:\nDeep Dive\nScreen Taste & Craft Deep Dive",
    "questions": [
      {
        "id": "skip_deep_dive",
        "type": "section_skip",
        "text": "Skip this section"
      },
      {
        "id": "foreign_films",
        "type": "radio",
        "text": "How do you feel about foreign films & shows?",
        "options": [
          {
            "value": "love",
            "label": "Yes, I live for subtitles"
          },
          {
            "value": "dubbed",
            "label": "As long as it's dubbed, I'm fine"
          },
          {
            "value": "sometimes",
            "label": "Sometimes, really depends on the movie"
          },
          {
            "value": "not_really",
            "label": "Not really"
          },
          {
            "value": "demanding",
            "label": "Subtitles demand full attention (can't multitask)"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "cinematography",
        "type": "radio",
        "text": "How important is cinematography?",
        "options": [
          {
            "value": "obsessed",
            "label": "Obsessed. I pause scenes to admire lighting."
          },
          {
            "value": "nice",
            "label": "Nice to have, but not a dealbreaker"
          },
          {
            "value": "palette",
            "label": "Only if it has a colour palette worth mood-boarding"
          },
          {
            "value": "skip",
            "label": "I skip to the dialogue"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "directors",
        "type": "checkbox",
        "text": "🎬 Do you care about directing styles?",
        "options": [
          {
            "value": "custom_directors",
            "label": "Name-drop your director icons here"
          },
          {
            "value": "none",
            "label": "I don't know any directors and I don't care…lol"
          },
          {
            "value": "toggle_categories",
            "label": "Select by category"
          },
          {
            "value": "header_modern",
            "label": "MODERN ICONS & CROWD PLEASERS"
          },
          {
            "value": "gerwig",
            "label": "Greta Gerwig"
          },
          {
            "value": "peele",
            "label": "Jordan Peele"
          },
          {
            "value": "spielberg",
            "label": "Steven Spielberg"
          },
          {
            "value": "tarantino",
            "label": "Quentin Tarantino"
          },
          {
            "value": "pta",
            "label": "Paul Thomas Anderson"
          },
          {
            "value": "daniels",
            "label": "The Daniels (Daniel Kwan & Daniel Scheinert)"
          },
          {
            "value": "nolan",
            "label": "Christopher Nolan"
          },
          {
            "value": "fennell",
            "label": "Emerald Fennell"
          },
          {
            "value": "lucas",
            "label": "George Lucas"
          },
          {
            "value": "jackson",
            "label": "Peter Jackson"
          },
          {
            "value": "howard",
            "label": "Ron Howard"
          },
          {
            "value": "cameron",
            "label": "James Cameron"
          },
          {
            "value": "phillips",
            "label": "Todd Phillips"
          },
          {
            "value": "scott",
            "label": "Ridley Scott"
          },
          {
            "value": "boyle",
            "label": "Danny Boyle"
          },
          {
            "value": "miyazaki",
            "label": "Hayao Miyazaki"
          },
          {
            "value": "bong_joon_ho",
            "label": "Bong Joon-ho"
          },
          {
            "value": "hughes",
            "label": "John Hughes"
          },
          {
            "value": "header_grit",
            "label": "GRIT, CRIME & INTENSITY"
          },
          {
            "value": "spike_lee",
            "label": "Spike Lee"
          },
          {
            "value": "larry_clark",
            "label": "Larry Clark"
          },
          {
            "value": "adrian_lyne",
            "label": "Adrian Lyne"
          },
          {
            "value": "scorsese",
            "label": "Martin Scorsese"
          },
          {
            "value": "de_palma",
            "label": "Brian De Palma"
          },
          {
            "value": "safdie",
            "label": "Safdie Brothers"
          },
          {
            "value": "coen_bros",
            "label": "Coen Brothers"
          },
          {
            "value": "eastwood",
            "label": "Clint Eastwood"
          },
          {
            "value": "fincher",
            "label": "David Fincher"
          },
          {
            "value": "meirelles",
            "label": "Fernando Meirelles"
          },
          {
            "value": "mann",
            "label": "Michael Mann"
          },
          {
            "value": "mangold",
            "label": "James Mangold"
          },
          {
            "value": "mcqueen",
            "label": "Steve McQueen"
          },
          {
            "value": "ritchie",
            "label": "Guy Ritchie"
          },
          {
            "value": "audiard",
            "label": "Jacques Audiard"
          },
          {
            "value": "header_dark",
            "label": "DARK, SURREAL & MIND-BENDING"
          },
          {
            "value": "lynch",
            "label": "David Lynch"
          },
          {
            "value": "kubrick",
            "label": "Stanley Kubrick"
          },
          {
            "value": "jonze",
            "label": "Spike Jonze"
          },
          {
            "value": "inarritu",
            "label": "Alejandro González Iñárritu"
          },
          {
            "value": "glazer",
            "label": "Jonathan Glazer"
          },
          {
            "value": "ostlund",
            "label": "Ruben Östlund"
          },
          {
            "value": "villeneuve",
            "label": "Denis Villeneuve"
          },
          {
            "value": "argento",
            "label": "Dario Argento"
          },
          {
            "value": "lanthimos",
            "label": "Yorgos Lanthimos"
          },
          {
            "value": "noe",
            "label": "Gaspar Noé"
          },
          {
            "value": "von_trier",
            "label": "Lars von Trier"
          },
          {
            "value": "tarkovsky",
            "label": "Andrei Tarkovsky"
          },
          {
            "value": "haneke",
            "label": "Michael Haneke"
          },
          {
            "value": "seidl",
            "label": "Ulrich Seidl"
          },
          {
            "value": "park_chan_wook",
            "label": "Park Chan-wook"
          },
          {
            "value": "oshima",
            "label": "Nagisa Oshima"
          },
          {
            "value": "weerasethakul",
            "label": "Apichatpong Weerasethakul"
          },
          {
            "value": "header_stylized",
            "label": "STYLIZED VIBES & AESTHETICS"
          },
          {
            "value": "coppola_s",
            "label": "Sofia Coppola"
          },
          {
            "value": "wes_anderson",
            "label": "Wes Anderson"
          },
          {
            "value": "korine",
            "label": "Harmony Korine"
          },
          {
            "value": "burton",
            "label": "Tim Burton"
          },
          {
            "value": "schnabel",
            "label": "Julian Schnabel"
          },
          {
            "value": "sorrentino",
            "label": "Paolo Sorrentino"
          },
          {
            "value": "cuaron",
            "label": "Alfonso Cuarón"
          },
          {
            "value": "waters",
            "label": "John Waters"
          },
          {
            "value": "marshall",
            "label": "Rob Marshall"
          },
          {
            "value": "roeg",
            "label": "Nicolas Roeg"
          },
          {
            "value": "song",
            "label": "Céline Song"
          },
          {
            "value": "wells",
            "label": "Charlotte Wells"
          },
          {
            "value": "rohrwacher",
            "label": "Alice Rohrwacher"
          },
          {
            "value": "potter",
            "label": "Sally Potter"
          },
          {
            "value": "julien",
            "label": "Isaac Julien"
          },
          {
            "value": "russell",
            "label": "Ken Russell"
          },
          {
            "value": "almodovar",
            "label": "Pedro Almodóvar"
          },
          {
            "value": "guadagnino",
            "label": "Luca Guadagnino"
          },
          {
            "value": "denis",
            "label": "Claire Denis"
          },
          {
            "value": "beineix",
            "label": "Jean-Jacques Beineix"
          },
          {
            "value": "greenaway",
            "label": "Peter Greenaway"
          },
          {
            "value": "yimou",
            "label": "Zhang Yimou"
          },
          {
            "value": "wong_kar_wai",
            "label": "Wong Kar-wai"
          },
          {
            "value": "header_humanist",
            "label": "HUMANIST, INDIE & EMOTIONAL"
          },
          {
            "value": "jenkins",
            "label": "Barry Jenkins"
          },
          {
            "value": "trier",
            "label": "Joachim Trier"
          },
          {
            "value": "nichols",
            "label": "Mike Nichols"
          },
          {
            "value": "van_sant",
            "label": "Gus Van Sant"
          },
          {
            "value": "cassavetes",
            "label": "John Cassavetes"
          },
          {
            "value": "allen",
            "label": "Woody Allen"
          },
          {
            "value": "baumbach",
            "label": "Noah Baumbach"
          },
          {
            "value": "salles",
            "label": "Walter Salles"
          },
          {
            "value": "zhao",
            "label": "Chloé Zhao"
          },
          {
            "value": "linklater",
            "label": "Richard Linklater"
          },
          {
            "value": "baker",
            "label": "Sean Baker"
          },
          {
            "value": "duvernay",
            "label": "Ava DuVernay"
          },
          {
            "value": "triet",
            "label": "Justine Triet"
          },
          {
            "value": "meyers",
            "label": "Nancy Meyers"
          },
          {
            "value": "heckerling",
            "label": "Amy Heckerling"
          },
          {
            "value": "daldry",
            "label": "Stephen Daldry"
          },
          {
            "value": "arnold",
            "label": "Andrea Arnold"
          },
          {
            "value": "loach",
            "label": "Ken Loach"
          },
          {
            "value": "haigh",
            "label": "Andrew Haigh"
          },
          {
            "value": "leigh",
            "label": "Mike Leigh"
          },
          {
            "value": "ramsay",
            "label": "Lynne Ramsay"
          },
          {
            "value": "sciamma",
            "label": "Céline Sciamma"
          },
          {
            "value": "varda",
            "label": "Agnès Varda"
          },
          {
            "value": "wenders",
            "label": "Wim Wenders"
          },
          {
            "value": "ade",
            "label": "Maren Ade"
          },
          {
            "value": "kechiche",
            "label": "Abdellatif Kechiche"
          },
          {
            "value": "ozpetek",
            "label": "Ferzan Özpetek"
          },
          {
            "value": "header_legends",
            "label": "THE LEGENDS & CLASSICS"
          },
          {
            "value": "welles",
            "label": "Orson Welles"
          },
          {
            "value": "bergman",
            "label": "Ingmar Bergman"
          },
          {
            "value": "hitchcock",
            "label": "Alfred Hitchcock"
          },
          {
            "value": "leone",
            "label": "Sergio Leone"
          },
          {
            "value": "ford",
            "label": "John Ford"
          },
          {
            "value": "hawks",
            "label": "Howard Hawks"
          },
          {
            "value": "lumet",
            "label": "Sidney Lumet"
          },
          {
            "value": "reed",
            "label": "Carol Reed"
          },
          {
            "value": "antonioni",
            "label": "Michelangelo Antonioni"
          },
          {
            "value": "coppola_ff",
            "label": "Francis Ford Coppola"
          },
          {
            "value": "bertolucci",
            "label": "Bernardo Bertolucci"
          },
          {
            "value": "lean",
            "label": "David Lean"
          },
          {
            "value": "fellini",
            "label": "Federico Fellini"
          },
          {
            "value": "rossellini",
            "label": "Roberto Rossellini"
          },
          {
            "value": "truffaut",
            "label": "François Truffaut"
          },
          {
            "value": "malle",
            "label": "Louis Malle"
          },
          {
            "value": "pasolini",
            "label": "Pier Paolo Pasolini"
          },
          {
            "value": "mizoguchi",
            "label": "Kenji Mizoguchi"
          },
          {
            "value": "ozu",
            "label": "Yasujiro Ozu"
          },
          {
            "value": "pollack",
            "label": "Sydney Pollack"
          },
          {
            "value": "header_special",
            "label": "SPECIAL"
          },
          {
            "value": "other",
            "label": "Did we miss a favourite? Drop their names here."
          }
        ]
      },
      {
        "id": "top_3_documentaries",
        "type": "textarea",
        "text": "What are your top 3 documentaries?🍿"
      },
      {
        "id": "access_growing_up",
        "type": "checkbox",
        "text": "How did you mostly access movies growing up?",
        "options": [
          {
            "value": "blockbuster",
            "label": "Blockbuster / VHS"
          },
          {
            "value": "cinema",
            "label": "Cinema / festivals"
          },
          {
            "value": "tv",
            "label": "TV & cable classics"
          },
          {
            "value": "streaming",
            "label": "Streaming-only (Netflix era)"
          },
          {
            "value": "pirate",
            "label": "Pirate passion (Studying via downloads)"
          },
          {
            "value": "mentor",
            "label": "Film school or family curation"
          },
          {
            "value": "religious",
            "label": "Religious / censored media only"
          },
          {
            "value": "late",
            "label": "I discovered film late"
          },
          {
            "value": "rare",
            "label": "Rare occasions only"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      }
    ]
  },
  {
    "id": "section-swipe",
    "title": "Who’s your on-screen alter ego?",
    "questions": [
      {
        "id": "alter-ego",
        "type": "text",
        "text": "Who's your on-screen alter ego?"
      }
    ]
  },
  {
    "id": "section-ix",
    "title": "FateFlix Fit & Feedback",
    "questions": [
      {
        "id": "selection_method",
        "type": "checkbox",
        "text": "In a minefield of content... how do you actually choose your next movie or show?",
        "options": [
          {
            "value": "scroll",
            "label": "I scroll until something clicks (Netflix/Prime/MUBI/AppleTV)"
          },
          {
            "value": "notes",
            "label": "Chaotic Notes app lists"
          },
          {
            "value": "people",
            "label": "I follow people, not lists (actors, directors, crushes)"
          },
          {
            "value": "google",
            "label": "Google it (search or ratings)"
          },
          {
            "value": "reviews",
            "label": "Ratings & reviews (Letterboxd, IMDb, Rotten Tomatoes, Reddit, Metacritic)"
          },
          {
            "value": "top10",
            "label": "I trust what’s trending (Top 10)"
          },
          {
            "value": "friend",
            "label": "I ask my film friend"
          },
          {
            "value": "vibes",
            "label": "I choose by mood or aesthetic"
          },
          {
            "value": "comfort",
            "label": "Comfort rewatch (decision successfully avoided)"
          },
          {
            "value": "fatigue",
            "label": "Decision fatigue is real. Just pick for me."
          },
          {
            "value": "ai",
            "label": "I ask AI"
          },
          {
            "value": "unavailable",
            "label": "It’s never on the platform I’m paying for."
          },
          {
            "value": "trailer_spiral",
            "label": "Trailer Spiral. Movie night becomes trailer night... again."
          },
          {
            "value": "fateflix",
            "label": "Just waiting for FateFlix to drop 😌"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "discovery_apps",
        "type": "checkbox",
        "text": "Which of these apps do you actually use for movie discovery?",
        "options": [
          {
            "value": "letterboxd",
            "label": "Letterboxd"
          },
          {
            "value": "imdb",
            "label": "IMDb"
          },
          {
            "value": "rotten_tomatoes",
            "label": "Rotten Tomatoes"
          },
          {
            "value": "taste_io",
            "label": "Taste.io"
          },
          {
            "value": "social",
            "label": "Social media (TikTok, Instagram, YouTube)"
          },
          {
            "value": "upflix",
            "label": "Upflix"
          },
          {
            "value": "moviepal",
            "label": "Moviepal"
          },
          {
            "value": "justwatch",
            "label": "JustWatch"
          },
          {
            "value": "tv_time",
            "label": "TV Time"
          },
          {
            "value": "reelgood",
            "label": "Reelgood"
          },
          {
            "value": "metacritic",
            "label": "Metacritic"
          },
          {
            "value": "none",
            "label": "None"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "discovery",
        "type": "radio",
        "text": "How did you find out about this survey?",
        "options": [
          {
            "value": "friend",
            "label": "A friend sent it to me"
          },
          {
            "value": "founder",
            "label": "Invited by a FateFlix founder"
          },
          {
            "value": "online",
            "label": "Stumbled upon it online"
          },
          {
            "value": "school",
            "label": "Film school / class"
          },
          {
            "value": "event",
            "label": "Public event or street moment"
          },
          {
            "value": "cosmic",
            "label": "Cosmic Calling"
          },
          {
            "value": "other",
            "label": "Other"
          }
        ]
      },
      {
        "id": "open_feedback",
        "type": "textarea",
        "text": "Anything we should know? 📝"
      },
      {
        "id": "qr_share",
        "type": "qr_share",
        "text": "Would you share this\nquiz with your friends?"
      }
    ]
  }
];
