/*
combined files : 

/kissy-gallery/JobManager/1.0/build/index

*/
/**
 * @fileoverview
 * @author xuejia.cxj<570171025@qq.com>
 * @module JobManager
 **/
KISSY.add('/kissy-gallery/JobManager/1.0/build/index', function(S, Node, Base) {
    var EMPTY = '';
    var $ = Node.all;
    var ProtoMethod = null;
    var Attrs = null;
    var TestWorker = null;

    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        }).toUpperCase();
    }

    var Event = {
        bind: function(ev, callback) {
            var evs = ev.split(' ');
            var calls = this._callbacks || (this._callbacks = {});
            for (var i = 0; i < evs.length; i++)
                (this._callbacks[evs[i]] || (this._callbacks[evs[i]] = [])).push(callback);
            return this;
        },
        trigger: function() {
            var args = Array.prototype.slice.call(arguments, 0);
            var ev = args.shift();
            var list, calls, i, l;
            if (!(calls = this._callbacks)) return this;
            if (!(list = this._callbacks[ev])) return this;
            for (i = 0, l = list.length; i < l; i++) {
                list[i].apply(this, args);
            }
            return this;
        },
        remove: function(ev) {
            if (!this._callbacks) return this;
            if (!this._callbacks[ev]) return this;
            this._callbacks[ev] = [];
        },
        unbind: function(ev, callback) {
            if (!ev) {
                this._callbacks = {};
                return this;
            }
            var list, calls, i, l;
            if (!(calls = this._callbacks)) return this;
            if (!(list = this._callbacks[ev])) return this;

            for (i = 0, l = list.length; i < l; i++) {
                if (callback === list[i]) {
                    list.splice(i, 1);
                    break;
                }
            }
            return this;
        }
    };

    /**
     * @method getObjKeys
     * @param  {Object}
     * @return {Array}--keys
     */

    function getObjKeys(obj) {
        var keys = [];
        for (attr in obj)
            if (obj.hasOwnProperty(attr)) {
                keys.push(attr);
            }
        return keys;
    }

    /**
     * @method sampledArr
     */

    function sampledArr(Arr, size) {
        if (!Arr instanceof Array) return [];
        var len = Arr.length;
        var size = Math.min(len, size);
        var sampledCount = 0;
        var ret = [];
        var it;

        //judge if item is in ret array

        function inRet(it) {
            if (!it) return false;
            var i;
            var l = ret.length;
            // Can't use hashmap to test, because  of ie 6 has no JSON
            for (i = 0; i < l; i++) {
                if (ret[i] === it) {
                    return true;
                }
            }
            return false;
        }

        //get a random item from Arr

        function getRandomIt() {
            var i = (Math.random() * len - 0.001) << 0;
            return Arr[i];
        }

        while (sampledCount < size) {
            it = getRandomIt();
            if (!inRet(it)) {
                sampledCount += 1;
                ret.push(it);
            }
        }
        return ret;
    }

    /**
     *
     * @class Manager
     * @constructor
     * @extends Base
     */

    function Manager(comConfig) {
        var self = this;
        if (!self instanceof Manager) {
            return new Manager(arguments);
        }
        self.parent = Manager;
        /**
         * @Attr {Object}
         * @DESC    the workers collection
         *          guid -- worker pairs
         */
        self.workers = {};
        /**
         *
         * @attr {Object}
         */
        self.conf = {
            stratergy: 'random', //random-inviewport, inViewPort, all, 
            maxworker: 100,
            workerClass: {
                //the js class of worker
                klass: null,
                //static dom containers for rerender
                staticDomContainers: [],
                //the css classfier for worker's dom
                params: null
            },
        };
        self._init();
        //调用父类构造函数
        Manager.superclass.constructor.call(self, comConfig);
    }

    ProtoMethod = {
        _init: function() {
            var self = this;
            console.log('init Manager');
            //event center for manager
            for (attr in Event) {
                self[attr] = Event[attr];
            }
            //run stratergies
            self.Stratergy = {
                random:  function(){
                    self.runRandom();
                }
            };
            self._bindJobEvents();
        },
        //random with 
        runRandom: function() {
            var self = this;
            var workers = self.workers;
            //work queue for every round 
            // console.log(self);
            self._generateWorkQueue();
            var workerQueue = self.workerQueue;
            var i;
            var l;
            var job;
            var woker;
            for (i = 0, l = workerQueue.length; i < l; i++) {
                job = workerQueue[i];
                worker = workers[job[0]];
                worker.work(job, self);
            }
        },
        //run
        run: function() {
            var self = this;
            var stratergy = self.conf['stratergy'] || 'random';
            self.Stratergy[stratergy]();
            return self;
        },
        //stop
        stop: function() {},
        reStore: function() {
            var self = this;
            if (self.conf.workerClass.staticDomContainers.length === 0) return;
        },
        hasJob: function() {
            var self = this;
            var workerQueue = self.workerQueue;
            var i;
            var job;
            for (i = 0; i < l; i++) {
                job = workerQueue[i];
                if (job[1] != job[3]) return true;
            }
            return false;
        },
        //config function
        config: function(confs) {
            var self = this;
            for (attr in confs) {
                self.conf[attr] = confs[attr];
            }
            return self;
        },
        addWorker: function(workerInstance) {
            var self = this;
            var worker = self.makeWorker(workerInstance);
            self.workers[worker.id] = worker;
            return self;
        },
        removeWorker: function(id) {
            var self = this;
            delete self.workers[''];
            return self;
        },
        _generateWorkQueue: function() {
            var self = this;
            var workerRange = self.conf.workerRange || [2, 4];
            var workTimeRange = self.conf.workTimeRange || [1, 3];
            var self = this;
            var keys = getObjKeys(self.workers);
            var workerQueue = [];
            var workerNeeded = Math.floor((Math.random() * workerRange[0] + (workerRange[1] - workerRange[0])));
            var neededWorkers = sampledArr(keys, workerNeeded);
            var i;
            for (i = 0; i < workerNeeded; i++) {
                workerQueue.push([
                    neededWorkers[i],
                    Math.random() * workTimeRange[0] + workTimeRange[1] - workTimeRange[0],
                    0
                ]);
            }
            self.workerQueue = workerQueue;
            self.jobFinished = 0;
            // console.log(workerQueue);
            return workerQueue;
        },
        _bindJobEvents: function() {
            var self = this;
            //bind finish One Round event
            self.bind('finishOneRound', function() {
                // console.log(self);
                self._generateWorkQueue();
                console.log('finish a one ROund');
                self.run();
            });

            //bind finish a job
            self.bind('finishedAJob', function() {
                self.jobFinished += 1;
                console.log('finish a job');
                if (self.jobFinished == self.workerQueue.length) {
                    self.trigger('finishOneRound');
                    self
                }
            });
        },
        makeWorker: function(workerInstance) {
            var self = this;
            if (typeof workerInstance.work !== 'function') {
                workerInstance.work = function() {};
            }
            workerInstance.id = guid();
            var interval = workerInstance.interval || 1000;

            workerInstance.work = function(job, manager) {
                var self = this;
                var t;
                self.timesToRun = job[1];

                function func() {
                    t = setTimeout(function() {
                        // console.log(self.timesToRun);
                        console.log(job);
                        if (self.timesToRun > 0) {
                            self.run();
                            self.timesToRun -= 1;
                            func();
                        } else {
                            manager.trigger('finishedAJob', job);
                            clearTimeout(t);
                        }
                    }, interval);
                }
                func();
            }
            return workerInstance;
        }
    };

    Attrs = {
        stratergy: 'random', //random-inviewport, inViewPort, all, 
        maxworker: 100,
        workerClass: {
            //the js class of worker
            klass: null,
            //static dom containers for rerender
            staticDomContainers: [],
            //the css classfier for worker's dom
            params: null
        },
        workerRange: [2, 4],
        workTimeRange: [1, 3]
    };

    TestWorker = function() {
        var self = this;
        self.attr = 'haha';
        self.interval = 2000;
        self.run = function() {
            var self = this;
            console.log(self.id || self.attr);
        }
        self.work = function() {
            var self = this;
            setTimeOut(self.run(), self.interval);
        }
    }

    S.extend(Manager, Base, ProtoMethod, {
        ATTRS: Attrs,
        TestWorker: TestWorker
    });
    return Manager;
}, {requires: ['node', 'base'] });
