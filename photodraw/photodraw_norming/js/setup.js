// Globals
batch_num = 1  // _.random(7);
scale = [
    "Not At All", 
    "Somewhat",
    "Moderately",
    "Very", 
    "Extremely"
];

// Define experiment metadata object
function Experiment () {
  this.type = 'survey-likert';
  this.dbname = 'photodraw';
  this.colname = 'sketchy32'
  this.iterationName = 'livetest1';   // remember to change to correct iteration name when running study   livetest1
  this.devMode = false; // Change this to TRUE if testing in dev mode (short trial videos) or FALSE for real experiment
}

function setupGame() {
  // get experiment ID information from URL
  var queryString = window.location.search;
  var urlParams = new URLSearchParams(queryString);
  var prolificID = urlParams.get('PROLIFIC_PID')   // ID unique to the participant
  var studyID = urlParams.get('STUDY_ID')          // ID unique to the study
  var sessionID = urlParams.get('SESSION_ID')      // ID unique to the particular submission
  
  var counter = 1;
  var lastresponse = null;
  var lazyResponder = false;
  var repeat_offender = false;
  var num_failed = 0;
  var main_on_finish = function(data) {
    
    console.log('emitting trial data', data)
    
    // add a counter to make sure participants are guessing different things
    if (data.type == 'survey-likert') {
      var thisresponse = JSON.parse(data.responses)['typicality']
      if (lastresponse == thisresponse) {
        counter += 1
      } else {
        counter = 1
      }
      if (counter >= 9) {
        alert("Are you sure about your response? We noticed that you are giving the same rating to a large number of images. Please do your best to use the full range of response options in the survey.")
        counter = 1
        repeat_offender = (lazyResponder ? true : false)
        lazyResponder = true
      }
      lastresponse = thisresponse
    }

    // see if participants failed the catch trials  
    if (data.catch_trial == true) {
      var response = JSON.parse(data.responses)['typicality']
      if ([0,1,4,7].some(v => data.questions[0]['prompt'].includes(v))) {
        if (!(response == 'Very' || response == 'Extremely')) {
          num_failed += 1
        }
      } else {
        if (!(response == 'Not At All' || response == 'Somewhat')) {
          num_failed += 1
        }
      }
    }
  }

  var additionalInfo = {
    prolificID: prolificID,
    studyID: studyID,
    sessionID: sessionID,  // this is the same as gameID
    gameID: '123',   // we can replace with sessionID if we want to
    on_finish: main_on_finish
  }    

  // Create raw trials list
  function createTrialsList(callback) {
    rawTrials = _.map(_.shuffle(metadata32.filter(o => o.batch_num == batch_num)), function(n, i) {
      return trial = _.extend({}, new Experiment, {
          batch_num: batch_num,
          category: n.category,
          preamble: "How well does this image represent the category?",
          required: true,
          catch_trial: false,
          img_id: n.s3_url,
          questions: [
              {prompt: "<p id='trialprompt'>" + (n.category === 'car_(sedan)' ? 'car' : n.category) + "</p><div><img src='"+ n.s3_url + "'></div>", 
              labels: scale,
              name: 'typicality'}
          ]
        }
      );
    })
    callback(rawTrials) // add catch trials
  };

  function createCatchTrials(callback) {
    // manually create a catch trial metadata object
    catch_paths = [{'category': 'pickup truck', 'path': 'stimuli/catch_trials/0_ford_truck.jpg'},   {'category': 'dog', 'path': 'stimuli/catch_trials/1_german_shepherd.jpg'}, 
                  {'category': 'pickup truck', 'path': 'stimuli/catch_trials/2_oddtruck.jpg'},     {'category': 'dog', 'path': 'stimuli/catch_trials/3_bedlington_terrier.jpg'}, 
                  {'category': 'pickup truck', 'path': 'stimuli/catch_trials/4_pickup_truck.jpg'}, {'category': 'dog', 'path': 'stimuli/catch_trials/5_wierd_dog.jpg'}, 
                  {'category': 'pickup truck', 'path': 'stimuli/catch_trials/6_wierdtruck.jpg'},   {'category': 'dog', 'path': 'stimuli/catch_trials/7_golden_retriever.jpg'}]
                  
    // make list of catch trials in same format as the other trials
    catchtrials = _.map(catch_paths, function(n,i) {
      return trial = _.extend({}, new Experiment, {
        batch_num: batch_num,
        category: n.category,
        preamble: "How well does this image represent the category?",
        required: true,
        catch_trial: true,
        img_url: n.path,
        questions: [
          {prompt: "<p id='trialprompt'>" + n.category + "</p><div><img src='"+ n.path + "'></div>", 
          labels: scale,
          name: 'typicality'}
        ]
      });
    })

    // add catch trials to trial list, evenly distributed
    before_length = rawTrials.length
    catchtrials.forEach(function(n, i) {
      rawTrials.splice((i+1)*(before_length / catchtrials.length), 0, n)   // trials.length / catchtrials.length
    })

    // add trialNum to trial list with catch trials included now
    rawTrials = rawTrials.map((n,i) => {
              var o = Object.assign({}, n);
              o.trialNum = i
              return o
    })

    var trials = _.flatten(_.map(rawTrials, function(trialData, i) {
      var trial = _.extend({}, additionalInfo, trialData, {trialNum: i}); 
        return trial;
      })); 	  
    callback(trials);
  };

  // Define consent form language             
  consentHTML = {    
    'str1' : '<p> Hello! In this study, you will be providing ratings for various objects! </p><p> We expect the average game to last about 15 minutes, including the time it takes to read these instructions. For your participation in this study, you will be paid $3.00.</p><i><p> Note: We recommend using Chrome. We have not tested this study in other browsers.</p></i>',
  }
  // Define instructions language
  instructionsHTML = {  
    'str1' : "<p id = 'tightinstruction'> We are interested in your first impression when looking at an object --- specifically, <i> how well it fits your idea of what that kind of object looks like</i>. \
    For example, you might consider the golden retriever to strongly fit your idea of what a typical dog looks like. On the other hand, the bedlington terrier may not.</p><div class=\"image123\"><div class=\"imgContainer\"> <p>golden retriever</p> <img src=\"stimuli/typical_dog.jpg\" width=\"300\" height=\"200\"> </div> <div class=\"imgContainer\"> <p>bedlington terrier</p> <img src=\"stimuli/atypical_dog.jpg\" width=\"300\" height=\"200\"/></div></div> <p> Notice that this kind of judgment has nothing to do with how much you like an object; you can like bedlington terriers more and still think of golden retrievers as being a more typical looking dog.",   // how should we define typical for participants?
    'str2' : '<p id = "exampleprompt"> On each trial you will be shown an image and a category label (e.g. "strawberry"). Your job will be to rate how well that image fits your idea of what members of that category look like. Here is an example of a trial: <br> <img id="exampleimg" height = "450" src = "stimuli/example_norming_trial.png"></p><p> When rating the images, we ask you to try to use the full range of options available.</p>',
    'str3' : "<p> In total, this study should take around 15 minutes. Once you are finished, the study will be automatically submitted for approval. If you encounter a problem or error, please send us an email <a href='mailto://cogtoolslab.requester@gmail.com'>(cogtoolslab.requester@gmail.com)</a> and we will make sure you're compensated for your time. Thank you again for contributing to our research! Let's begin! </p>"
  }  

  // Create consent + instructions instructions trial
  var welcome = {
    type: 'instructions',
    pages: [
      consentHTML.str1,
      instructionsHTML.str1,
      instructionsHTML.str2,
      instructionsHTML.str3,
    ],
    force_wait: 2000, 
    show_clickable_nav: true,
    allow_keys: false,
    allow_backward: false
  };

  // exit survey trials
  var surveyChoiceInfo = _.omit(_.extend({}, additionalInfo, new Experiment),['type','dev_mode']);  
  var exitSurveyChoice = _.extend( {}, surveyChoiceInfo, {
    type: 'survey-multi-choice',
    preamble: "<strong><u>Exit Survey</u></strong>",
    questions: [
      {prompt: "What is your sex?",
        name: "participantSex",
        horizontal: false,
        options: ["Male", "Female", "Neither/Other/Do Not Wish To Say"],
        required: true
      }
    ],
    on_finish: main_on_finish
  });

  // Add survey page after trials are done
  var surveyTextInfo = _.omit(_.extend({}, additionalInfo, new Experiment),['type','dev_mode']);
  var exitSurveyText =  _.extend({}, surveyTextInfo, {
    type: 'survey-text',
    preamble: "<strong><u>Exit Survey</u></strong>",
    questions: [
    { name: 'participantAge', 
      prompt: "Please enter your age", 
      placeholder: "e.g. 32",
      required: true
    },        
    { name: "criteriaForDecisions",
      prompt: "Please share a few words about how you made your judgements.",
      placeholder: "I made my judgements based on...",
      rows: 5, 
      columns: 50, 
      required: false
    },
    { name: 'participantComments', 
      prompt: "Thank you for participating in our HIT! Do you have any other comments or feedback to share with us about your experience?", 
      placeholder: "I had a lot of fun!",
      rows: 5, 
      columns: 50,
      required: false
    }
    ],
    on_finish: main_on_finish
  });    

  // Create goodbye trial (this doesn't close the browser yet)
  var goodbye = {
    type: 'instructions',
    pages: [
      'Thanks for participating in our experiment! You are all done now. Please click the button to be redirected to the prolific app (this will record your completion of the study).'
            ],
    show_clickable_nav: true,
    allow_backward: false,
    button_label_next: '< submit',    
    on_finish: () => { 
      boilerplate = _.omit(_.extend({}, new Experiment, additionalInfo), ['type', 'on_finish'])

      window.open("https://justintheyang.github.io/","_self")
    }
  }


  function addBookends(trials) {
    // add welcome trial to start of survey
    trials.unshift(welcome);
    
    // append exit surveys
    trials.push(exitSurveyChoice);
    trials.push(exitSurveyText);

    // append goodbye trial
    trials.push(goodbye);

    console.log('trials',trials);

    jsPsych.init({
        timeline: trials,
        default_iti: 1000,
        show_progress_bar: true
    });    
  }


  // create trials list and add instrutions and exit survey
  createTrialsList(function (rawTrials) {
    createCatchTrials(function (trials) {
      addBookends(trials);
    })
  })
}


