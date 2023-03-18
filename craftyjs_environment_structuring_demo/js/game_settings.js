function zip(a, b) {
  return a.map((k, i) => [k, b[i]]);
}
function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 *
 *  In progress: refactor game setting variable gs to a game_vars and a game_settings variable.
 *   - the game_vars variable should manage variables that are meant to change over the course of the game.
 *   - the game_settings variable should manage variables which are constant to the session.
 *   - a good rule of thumb is that gv can reference gs but not vice versa.
 *
 */

// defines game settings, stored in variable gs. Likely to be hosted on server eventually.
gs = {
  // define experiment metadata
  dbname: "environment_structuring",
  colname: "environment_structuring-simple-pilot-data",
  iterationName: "peer-pilot",
  prolific_completion_URL:
    "https://app.prolific.co/submissions/complete?cc=705D5E20",

  // define experiment layout
  num_rows: 15,
  num_columns: 15,
  num_stations: 5,

  // define item global variables
  num_unique_items: 1, // defines how many different items there are
  items_to_win: [5], // array of length num_unique_items detailing how many items of each type should be made
  recipes: {
    item0: [5, 5, 5, 5, 5], // maybe we can have hard-coded, named recipes?
    // item1: [1, 4, 6, 0, 2],
    // item2: [2, 1, 1, 4, 0]
  },

  trialNum: 0,

  // define player global variables
  max_capacity: 5, // player can hold up to max_capacity items
  move_station_cost: 5, // step cost of moving a station one block
  move_base_cost: 10, // step cost of moving the base one block

  // initalize some variables that are dependent on variables declared above
  init: function () {
    this.crafty_height = $(window).height() * 0.98;
    this.unit_size = (0.95 * this.crafty_height) / this.num_rows;
    this.unit_size = Math.floor(this.unit_size);

    this.total_ingredients_needed = Array(this.num_stations).fill(0);
    for (var sta = 0; sta < this.num_stations; sta++) {
      for (var i = 0; i < this.num_unique_items; i++) {
        this.total_ingredients_needed[sta] +=
          this.items_to_win[i] * this.recipes["item" + i][sta];
      }
    }

    this.instr_texts = [
      "Hello! In this study, you will be playing a game. In this game, the goal is to collect ingredients to build items.",
      "We expect the average game to last around 20 minutes, including the time it takes to go through these instructions.",
      "We recommend using Chrome. We have not tested this study in other browsers.",
      "By completing this session, you are participating in a study being performed by cognitive scientists at the University of California, San Diego, USA. \
            If you have questions about this research, please contact the <b>Cognitive Tools Lab</b> at <b><a href='mailto://cogtoolslab.requester@gmail.com'>cogtoolslab.requester@gmail.com</a></b>. \
            You must be at least 18 years old to participate. There are neither specific benefits nor anticipated risks associated with participation in this study. Your participation in this research is voluntary. \
            You may decline to answer any or all of the following questions. You may decline further participation, at any time, without adverse consequences. \
            Your anonymity is assured; the researchers who have requested your participation will not reveal any personal information about you.",
      "If you are ready, let's proceed!",
      "This is you. Try moving around with the arrow buttons!",
      "These are stations. If you move on top of a station, you're able collect items with the space key! (Hover over each station with your mouse for more info)",
      "This is the base. Try moving to the base and depositing the items you collected using the space key! You will notice that 'Capacity' resets to 0, and your ingredient list updates. You can collect up to " +
        this.max_capacity +
        " ingredients before depositing them in the base.",
      "On the right-hand side under <b>Recipes</b>, you will find ingredients for different recipes. Collect 5 ingredients from each station to make <b>Item 0</b>!",
      "Now that you have enough ingredients, go to the base, click <b>menu</b> on the upper-left, and then select <b>'0'</b> to make <b>Item 0</b>. To close the menu, simply click the button again, or move off the base.",
      "You will notice that under <b>Game info</b>, the 'Items made' tag changed. Your goal is to make <b>5</b> items in as few steps as possible.",
      "When your capacity is at <b>0</b>, you can move both the base and stations by toggling on the 'X' button. Try picking up the base and moving it around! You will notice that the steps increase by " +
        this.move_base_cost +
        ". (Press 'X' again to toggle off base movement)",
      "When you pick up a station, you will notice that the steps increase by " +
        this.move_station_cost +
        ".",
      "Try to use as few steps of possible to win the game! When you are ready, press the forward button to start the game!",
    ];

    this.prolificID = "";
    this.studyID = "";
    this.sessionID = "";
    this.gameID = "";

    return this;
  },
}.init();

// trial settings
ts = {
  // define trial-level information
  num_trials: 3,
  trials: {
    "trial_0": {
      "stations": {
        "0": [11, 9],
        "1": [4, 1],
        "2": [9, 0],
        "3": [7, 12],
        "4": [2, 13]
      }
    },
    "trial_1": {
      "stations": {
        "0": [5, 13],
        "1": [11, 4],
        "2": [1, 5],
        "3": [3, 11],
        "4": [10, 2]
      }
    },
    "trial_2": {
      "stations": {
        "0": [8, 3],
        "1": [14, 12],
        "2": [4, 14],
        "3": [12, 5],
        "4": [10, 2]
      }
    }
  }  
};


gv = {
  display_items: false,
  win_game: false,
  isInstr: true,
  current_capacity: 0,

  steps_taken: 0,
  move_station: false, // true iff we are moving a station right now
  move_base: false, // true iff we are moving the base right now

  selected_station_num: -1, // identifier for which station is being moved. Set to -1 for none.

  // for instructions
  instr_ind: 0,
  recipetxt: "",
  ingredients_on_hand_txt: "",
  ingredients_in_base_txt: "",

  init: function () {
    this.items_made = Array(gs.num_unique_items).fill(0);

    this.ingredients_on_hand = {};
    for (var i = 0; i < gs.num_stations; i++) {
      this.ingredients_on_hand["station" + i] = 0;
    }
    this.ingredients_in_base = {};
    for (var i = 0; i < gs.num_stations; i++) {
      this.ingredients_in_base["station" + i] = 0;
    }

    this.player = {
      x: Math.round((gs.num_columns - 1) / 2),
      y: Math.round((gs.num_rows - 1) / 2),
      can_move_station: false,
      can_move_base: true,
    };

    this.base = { x: this.player.x, y: this.player.y };

    this.stations = {};
    return this;
  },

  gen_modules: function (isInstr) {
    if (isInstr == true) {
      this.rowRange = -8;
      this.stations = {};
      this.spread = 0;
      var stations_pos = [
        [13, 3],
        [12, 7],
        [6, 2],
        [1, 4],
        [2, 6],
      ];

      // do {
      //     var stations_pos = zip(Array.from({length : gs.num_stations}, () => randomInteger(0, gs.num_columns - 1) ),
      //                            Array.from({length : gs.num_stations}, () => randomInteger(1, gs.num_rows + this.rowRange) ))
      //     for (var i = 0; i < stations_pos.length; i++) {
      //             for (var j = i + 1; j < stations_pos.length; j++) {
      //                 this.spread += 1 / Math.sqrt((stations_pos[i][0] - stations_pos[j][0])**2 + (stations_pos[i][1] - stations_pos[j][1])**2)
      //             }
      //         }
      // } while (this.spread < 0.1)

      for (var i = 0; i < gs.num_stations; i++) {
        this.stations[i] = {
          x: stations_pos[i][0],
          y: stations_pos[i][1],
          // onPlayer: false,
          e: Crafty.e("Station")
            .at(stations_pos[i][0], stations_pos[i][1], i)
            .setName("station" + i)
            .attach(
              Crafty.e("StationText")
                .at(stations_pos[i][0], stations_pos[i][1])
                .text(i)
            ),
        };
      }
    } else {
      // this.rowRange = -1
      var stations_pos = Object.values(
        ts.trials["trial_" + gs.trialNum]["stations"]
      );
      for (var i = 0; i < gs.num_stations; i++) {
        this.stations[i] = {
          x: stations_pos[i][0],
          y: stations_pos[i][1],
          // onPlayer: false,
          e: Crafty.e("Station")
            .at(stations_pos[i][0], stations_pos[i][1], i)
            .setName("station" + i)
            .attach(
              Crafty.e("StationText")
                .at(stations_pos[i][0], stations_pos[i][1])
                .text(i)
            ),
        };
      }
    }

    return this;
  },
}.init();

rayCastDirections = [];
for (var i = 0; i < 4; i++) {
  rayCastDirections[i] = new Crafty.math.Vector2D(
    Math.sin(Math.PI * (i / 2 + 1 / 4)),
    Math.cos(Math.PI * (i / 2 + 1 / 4))
  ).normalize();
}
