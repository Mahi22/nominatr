angular.module('mean.polls').controller('PollsController', ['$rootScope', '$scope', '$routeParams', '$location', '$timeout', 'Global', 'Polls', 'Votes', function ($rootScope, $scope, $routeParams, $location, $timeout, Global, Polls, Votes) {
  $scope.global = Global;

  $scope.choices = [{id: 'choice1'}, {id: 'choice2'}, {id: 'choice3'}];

  $rootScope.shouldRefresh = false;
  
  $scope.addNewChoice = function() {
    var newItemNo = $scope.choices.length+1;
    $scope.choices.push({'id':'choice'+newItemNo});
  };

  $scope.addNewChoiceToExisting = function() {
    var newItemNo = $scope.poll.choices.length+1;
    $scope.poll.choices.push({'id':'choice'+newItemNo});
  };

  $scope.ignored = function(choice) {
    return !choice.ignore;
  };

  $scope.create = function() {
    var poll = new Polls({
      name: this.name,
      choices: this.choices
    });
    poll.$save(function(response) {
      $location.path("polls/" + response._id);
    });

    this.name = "";
  };

  $scope.remove = function(poll) {
    poll.$remove();  

    for (var i in $scope.polls) {
      if ($scope.polls[i] == poll) {
        $scope.polls.splice(i, 1);
      }
    }
  };

  $scope.update = function() {
    var poll = $scope.poll;
    poll.$update(function() {
      $location.path('polls/' + poll._id);
    });
  };

  $scope.createGuestVotes = function() {
    console.log($scope.guestVotes);
    var vote = new Votes({
      'guest': $scope.guestVotes
    });
    vote.$save({
      pollId: $routeParams.pollId
    },function(response) {
      $scope.findOne();
      location.reload();
    });
  };

  $scope.updateVotes = function() {
    var votes = $scope.votes;
    votes.$update({
      pollId: $routeParams.pollId
    }, function() {
    });
  };

  $scope.find = function(query) {
    Polls.query(query, function(polls) {
      $scope.polls = polls;
    });
  };

  $scope.findOne = function() {
    Polls.get({
      pollId: $routeParams.pollId
    }, function(poll) {
      $scope.poll = poll;
      if ($scope.guestVotes == undefined) {
        $scope.guestVotes = new Votes();
        for (var i = 0; i < poll.choices.length; i++ ) {
          $scope.guestVotes[poll.choices[i]._id] = false;
        }
      }
    });
    Votes.get({
      pollId: $routeParams.pollId
    }, function(votes) {
      $scope.votes = votes;
      if ($scope.global.user && $scope.global.user._id in votes) {
        $scope.isParticipant = true;
      } else {
        $scope.isParticipant = false;
      }
    });
    $timeout.cancel($scope.timeout);
    if ($rootScope.shouldRefresh) {
      $scope.timeout = $timeout(function() {
        $scope.findOne();
      }, 2000);
    }
  };

  $scope.findOneAndRefresh = function() {
    $rootScope.shouldRefresh = true;
    $scope.findOne();
  };

  $scope.findOneAndStopRefresh = function() {
    $rootScope.shouldRefresh = false;
    $scope.findOne();
  };

  // Detect when the user makes a change
  $scope.$watch('votes',
    function(newValue,oldValue) {
      if (newValue != undefined && oldValue != undefined) {
        // Comparing stringified versions of the object so we can make a comparison based on values
        if (JSON.stringify(newValue[$scope.global.user._id]) != JSON.stringify(oldValue[$scope.global.user._id])) {
          // Send an update to the server
          $scope.updateVotes();
        }
      }
    },
  true);

}]);
