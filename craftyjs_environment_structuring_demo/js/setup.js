function setupGame() {
    gs.increment = (function (n) {
      return function () {
        n += 1;
        return n;
      };
    })(0);
    gs.on_finish = function (
      action,
      eventType,
      station_locs,
      item_click = "none"
    ) {
      date = new Date();
      var data = Object.assign(
        {},
        {
          action: action,
          action_num: gs.increment(),
          eventType: eventType,
          item_click: item_click,
          currentTime: date.getTime(),
        },
        gs,
        _.omit(gv, "stations", "menuItems", "capacity_circs", "stationInfo"),
        station_locs
      );
      console.log("Would have emitted trial data", data);
    };
    gs_deep = _.cloneDeep(gs);
    gv_deep = _.cloneDeep(gv);

    // initialize Crafty board
    Crafty.init(
      gs.unit_size * (5 + gs.num_columns + 5 + 0.5),
      $(window).height() * 0.97,
      document.getElementById("game")
    );

    // start game
    Crafty.scene("Instructions");
}
