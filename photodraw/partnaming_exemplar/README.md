This directory contains the code necessary to run the `partnaming_exemplar` norming study, which asks participants for a list of parts for each of the 1024 stimuli. 

<p align="center" style="font-size: smaller">
  <img width="85%" src="https://github.com/cogtoolslab/part_naming/blob/master/experiments/exemplar/stimuli/exemplarexample.png"></img>
</p>

### How to run the experiment
- SSH into user@cogtoolslab.org 
- run `node app.js --gameport XXXX` in the `photodraw_norming` directory
- run `node store.js` in the kiddraw directory
- navigate to https://cogtoolslab.org:XXXX/index.html to demo the experiment

Note: you need to run `npm install` to get `node-modules` in the experiment directory.
