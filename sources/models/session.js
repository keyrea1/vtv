function status(){
	return webix.ajax().post("http://127.0.0.1:2328/status")
		.then(a => a.json());
}

function getGlobals() {
    var xx;
    (function () {
        var localVar = window.storage.globalVar;
        xx = localVar;
    })();
    const _ = xx.app.getService("locale")._;
    const ip = xx.app.config.remoteHOST;
    const globals = xx.app.config.globals;

    var methodName = "getGlobals";
    webix.ajax().sync().post(ip, {"method": methodName, "user": 2, "params": []},
        function (text, xml, xhr) {
            var data = JSON.parse(text);
            console.log(data);
            if (data.method === methodName) {
                globals._package.dosing = data.params.dosing;
                globals._package.dynamic = data.params.dynamic;
                globals._package.one_c = data.params.one_c;
                globals._package.recognition = data.params.recognition;
                globals._package.rfid = data.params.rfid;
                globals._package.static_wagon = data.params.static_wagon;
                globals.blockingTime = new Date(data.params.blockinTime + 'T00:00:00Z');
                globals.hardware.typeOfScales = data.params.typeOfScales;
                globals.hardware.siNumber = data.params.siNumber;
                globals.hardware.accuracyType = data.params.accuracyType;
                globals.hardware.serialNumber = data.params.serialNumber;
                globals.organizationName = data.params.organizationName;
                newv => xx.app.config.globals = globals;
            }
        });
}


function getConfiguration() {
    var xx;
    (function () {
        var localVar = window.storage.globalVar;
        xx = localVar;
    })();
    const _ = xx.app.getService("locale")._;
    const ip = xx.app.config.remoteHOST;
    const globals = xx.app.config.globals;
    const configuration = xx.app.config.configuration;

    var methodName = "getConfiguration";
    webix.ajax().sync().post(ip, {"method": methodName, "user": 2, "params": []},
        function (text, xml, xhr) {
            var data = JSON.parse(text);
            console.log(data);
            if (data.method === methodName) {
                if (data.answer === "ok") {
                    configuration.wagon_weighing = data.params.wagon_weighing;
                    if (configuration.wagon_weighing === false) configuration.wagon_weighing = 1;
                    else configuration.wagon_weighing = 0;
                    configuration.platform_for_dynamic = data.params.platform_for_dynamic;
                    configuration.maximum_weight_at_zeroing = data.params.maximum_weight_at_zeroing;
                    configuration.gost = data.params.gost;
                    configuration.offset_lengthwise = data.params.longitudinal;
                    configuration.cross_offset = data.params.transverse;
                    configuration.auto_zero_correction.threshold = data.params.threshold;
                    configuration.auto_zero_correction.period = data.params.period;
                    newv => xx.app.config.configuration = configuration;
                }
                else webix.message({
                    type: "error",
                    text: _(data.params.message)
                });
            }
        });
}

function login(user, pass) {
    var xx;
    (function () {
        var localVar = window.storage.globalVar;
        xx = localVar;
    })();
    const _ = xx.app.getService("locale")._;
    const ip = xx.app.config.remoteHOST;
    const globals = xx.app.config.globals;
    var config = xx.app.config;
    var user_name = xx.app.config.user_name;
    var locale = xx.app.config.locale;
    var theme = xx.app.config.theme;

    var methodName = "check.validation";
    return webix.ajax().post(ip, {"method": methodName, "user": 2, "params": {"login": user, "password": pass}},
        function (text, xml, xhr) {
            var data = JSON.parse(text);
            if (data !== null) {
                console.log(data);
                if (data.method === methodName) {
                    if (data.answer === "ok") {
                        config.user = data.params.id;
                        config.user_name = data.params.user_name;
                        config.credentials = data.params.credentials;
                        config.locale = data.params.locale;
                        config.theme = data.params.theme;
                        config.counts = data.params.update_speed;
                        newv => xx.app.config = config;
                        globals.access.add_user = data.params.add_user;
                        globals.access.adding_arch_data = data.params.adding_arch_data;
                        globals.access.backup = data.params.backup;
                        globals.access.cancel_weighting = data.params.cancel_weighting;
                        globals.access.change_arch_data = data.params.change_arch_data;
                        globals.access.change_wagon_number = data.params.change_wagon_number;
                        globals.access.explore_logs = data.params.explore_logs;
                        globals.access.explore_weight_arch = data.params.explore_weight_arch;
                        globals.access.printing = data.params.printing;
                        globals.access.calibration = data.params.calibration;
                        globals.access.configuration = data.params.configuration;
                        globals.access.verification = data.params.verification;
                        globals.access.tara_control = data.params.tara_control;
                        globals.access.table_configuration = data.params.table_configuration;
                        globals.access.save_archive = data.params.save_archive;
                        globals.access.save_events = data.params.save_events;
                        newv => xx.app.config.globals = globals;
                        getGlobals();
                        getConfiguration();
                    }
                    else data = null
                }
            }
            else {
                webix.message({type: "error", text: _("Incorrect login or password")});
            }
        }).then(a => a.json());
}

function logout(){
	var _methodName = "logout";
	return webix.ajax().post("http://127.0.0.1:2328/logout",
		{"method": _methodName, "user": 2, "params": {}})
		.then(a => a.json());
}

function lock(){
	console.log("lock");
}

export default {
	status, login, logout
}
