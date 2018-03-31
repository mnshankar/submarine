var activeSubmarines = [];
var app = new Vue({
    el: "#app",
    data: {
        pubnub: null,
        submarineName: "",
        nameError: false,
        activeSubmarines: activeSubmarines
    },
    methods: {
        doPublish: function () {
            var doesContain = false;
            numActiveSubmarines = window.activeSubmarines.length;
            for (var i = 0; i < numActiveSubmarines; i++) {
                if (window.activeSubmarines[i].name === this.submarineName) {
                    doesContain = true;
                    break;
                }
            }
            if (!doesContain) {
                this.nameError=false;
                this.pubnub.publish(
                    {
                        channel: 'subchannel',
                        message: {
                            submarine: new Submarine(this.submarineName),
                            delete: false
                        },
                        x: (this.submarineName = '')
                    });
            } else {
                this.nameError = true;
            }
        },
        hideSubmarine: function (submarineToHide) {
            this.pubnub.publish(
                {
                    channel: 'subchannel',
                    message: {
                        submarine: submarineToHide,
                        delete: true
                    },
                    x: (this.submarineName = '')
                });

        }
    },
    created: function () {
        this.pubnub = new PubNub({
            publishKey: 'pub-c-04ba7926-70d0-4ed5-9691-5db5973850e8',
            subscribeKey: 'sub-c-3f0d8966-330b-11e8-8e6f-1abf34272f4e'
        });

        this.pubnub.subscribe({channels: ["subchannel"]});

        this.pubnub.addListener({
            message: function (obj) {
                var numActiveSubmarines = window.activeSubmarines.length;
                //message is of type delete. Remove from list
                if (obj.message.delete === true) {
                    numActiveSubmarines = window.activeSubmarines.length;
                    for (var i = 0; i < numActiveSubmarines; i++) {
                        if (window.activeSubmarines[i].name === obj.message.submarine.name) {
                            window.activeSubmarines.splice(i, 1);
                        }
                    }
                }
                else
                {
                    window.activeSubmarines.push(obj.message.submarine);
                }
            }
        });
    }
});