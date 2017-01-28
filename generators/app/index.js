'use strict';
var Generator = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = Generator.extend({

  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the' + chalk.yellow(' generator-vagrant-wp-devenv ') + ' generator!'
    ));

    var prompts = [{
      type: 'input',
      name: 'projectName',
      message: 'What is the name of the project (single word)? ',
      default: this.appname,
      required: true,
      store: true
    },
    {
      type: 'String',
      name: 'hostIP',
      message: 'What is the IP of the Virtual Machine? ',
      default: '192.168.33.30',
      required: true,
      store: true
    }
    ];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

  writing: function () {
    var d = new Date();

    // Copy vagrant required files
    this.fs.copyTpl(
      this.templatePath('vagrant/'),
      this.destinationPath(''),
      {
        projectName: this.props.projectName,
        projectYear: d.getFullYear(),
        hostIP: this.props.hostIP,
      }
    );

    // Copy hidden files
    this.fs.copyTpl(
      this.templatePath('vagrant/.*'),
      this.destinationPath(''),
      {
        projectName: this.props.projectName,
        projectYear: d.getFullYear(),
        hostIP: this.props.hostIP,
      }
    );

    // Copy theme files
    this.fs.copyTpl(
      this.templatePath('theme/'),
      this.destinationPath('wp/wp-content/themes/' + this.props.projectName +  '-' +d.getFullYear()),
      {
        projectName: this.props.projectName,
        projectYear: d.getFullYear(),
        hostIP: this.props.hostIP,
      }
    );

    // Copy installer
    this.fs.write(
      this.destinationPath('installers/.gitkeep'),
      ''
    );

  },

  install: function () {
    this.installDependencies({
      bower: false
    });
  },

  end: function() {
    this.log(yosay(
        "Don't forget to update your " +
        chalk.cyan('/etc/hosts') +
        " file with the provided IP and to copy the " +
        chalk.blue('genesis framework') +
        " on the installers folder"
    ));
  }

});
