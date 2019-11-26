import "./styles/app.css";
import {JetApp, HashRouter, EmptyRouter, plugins } from "webix-jet";
import session from "models/session";

export default class MyApp extends JetApp {
	constructor (config) {
		const size = () => {
			const screen = document.body.offsetWidth;
			return screen > 1210 ? "wide" : (screen > 1060 ? "mid" : "small");
		};
		let lastView;
		let user = "";
		let remoteHOST = "";
		let hideOptions = {};
		let ids = {};
		let theme = "";
		let cookies = true;
		let info = {};
		let globals = {};
		let configuration = {};
		let weighing = {};
		let requests = {};
		let pingTimer;

		try {
			theme = webix.storage.local.get("bank_app_theme");
		}
		catch (err) {
			cookies = false;
			webix.message("You disabled cookies. The language and theme won't be restored after page reloads.", "debug");
		}

		var date = new Date();
		date.setDate(date.getDate() + 30);

		const defaults = {
			id: APPNAME,
			version: VERSION,
			router: BUILD_AS_MODULE ? EmptyRouter : HashRouter,
			debug: !PRODUCTION,
			start: "/top/weighing",
			theme: theme || "",
			remoteHOST: "http://192.168.0.22:2328",////,"http://25.31.54.208:2328"
			remoteHOSTstatus: "http://192.168.0.22:2328",////,"http://25.31.54.208:2328"
			configuration: {
				brb: 12000,
				brh: 1620,
				brw: 4000,
				wagon_weighing: 1,
				platform_for_dynamic: 0,
				wagon_weighing_allowed: 0,
				weighing_allowed: 0,
				offset_lengthwise: 100,
				cross_offset: 100,
				capacity: 300,
				side_diff: 10000,
				maximum_weight_at_zeroing: 100,
				turn_on_zero_correction: false,
				display: false,
				gost: true,
				auto_zero_correction: {threshold: 40, period: 4},
				dynamics: {speedthreshold: 90, zerothreshold: 18, calming: 1, platform: 4110},
				max_speed_limit: 10,
				min_speed_limit: 2,
				isServerConnection: false,
				current_view: ""
			},
			user: 3,
			user_name: "user",
			locale: "ru",
			credentials: "admin",
			globals: {
				_package: {
					dosing: true,
					dynamic: true,
					one_c: true,
					recognition: true,
					rfid: true,
					static_wagon: true,
					show_serial: true
				},
				access: {
					add_user: true,
					adding_arch_data: true,
					backup: true,
					cancel_weighting: true,
					change_arch_data: true,
					change_wagon_number: true,
					explore_logs: true,
					explore_weight_arch: true,
					printing: true,
					calibration: true,
					configuration: true,
					verification: true,
					save_archive: true,
					save_events: true,
					table_configuration: true,
					tara_control: true
				},
				organizationName: "Организация",
				distributor: "ООО ЗВО",
				hardware: {
					typeOfScales: "ВТВ-СД-200",
					siNumber: "63155-16",
					accuracyType: "OIML R76-1-2011-III",
					serialNumber: "000000"
				},
				software: {
					name: "VTV",
					version: "0.02.003 от 25.12.2018",
					ID: "Весы ВТВ",
					md5: "63705d4beb6e355f4e44d1a0da472d41",
					release: "0.3.0.9"
				},
				blockingTime: date
			},
			weighing: {
				static_name: "",
				statichidden: false,
				dynamichidden: true,
			},
			hideOptions: {
				"static.truck": {
					id: false,
					date: false,
					time: false,
					wagon_number: false,
					start_weight: false,
					doc_start_weight: false,
					brutto: false,
					cargo_weight: false,
					overload: false,
					doc_cargo_weight: false,
					doc_number: false,
					doc_date: false,
					cargo_name: false,
					capacity: false,
					truck1_weight: false,
					side_diff: false,
					offset_lengthwise: false,
					cross_offset: false,
					sender: false,
					reciever: false,
					transporter: false,
					departure_point: false,
					destination_point: false,
					cargo: false,
					axels_count: false,
					photo_path: false,
					train_number: true,
					wagon_type: false,
					optional1: false,
					optional2: false,
					optional3: false,
					optional4: false,
					optional5: false,
					autofilling: false,
					lastdateedited: false,
					lasttimeedited: false,
					lasttimeeditor: false,
					type: true,
					save: false
				},
				"static.wagon": {
					id: false,
					date: false,
					time: false,
					wagon_number: false,
					start_weight: false,
					doc_start_weight: false,
					brutto: false,
					cargo_weight: false,
					overload: false,
					doc_cargo_weight: false,
					doc_number: false,
					doc_date: false,
					cargo_name: false,
					capacity: false,
					truck1_weight: false,
					truck2_weight: false,
					truck_diff: false,
					side_diff: false,
					offset_lengthwise: false,
					cross_offset: false,
					sender: false,
					reciever: false,
					transporter: false,
					departure_point: false,
					destination_point: false,
					cargo: false,
					axels_count: false,
					photo_path: false,
					train_number: true,
					wagon_type: false,
					optional1: false,
					optional2: false,
					optional3: false,
					optional4: false,
					optional5: false,
					autofilling: false,
					lastdateedited: false,
					lasttimeedited: false,
					lasttimeeditor: false,
					type: true,
					save: false
				},
				"dynamic": {
					id: false,
					date: false,
					time: false,
					direction: false,
					wagon_number: false,
					start_weight: false,
					doc_start_weight: false,
					brutto: false,
					cargo_weight: false,
					overload: false,
					doc_cargo_weight: false,
					doc_number: false,
					doc_date: false,
					cargo_name: false,
					capacity: false,
					ft_axis_1: false,
					ft_axis_2: false,
					ft_axis_3: false,
					ft_axis_4: false,
					truck2_weight: false,
					st_axis_1: false,
					st_axis_2: false,
					st_axis_3: false,
					st_axis_4: false,
					truck_diff: false,
					side_diff: false,
					offset_lengthwise: false,
					cross_offset: false,
					speed: false,
					sender: false,
					reciever: false,
					transporter: false,
					departure_point: false,
					destination_point: false,
					cargo: false,
					axels_count: false,
					photo_path: false,
					train_number: false,
					wagon_type: false,
					optional1: false,
					optional2: false,
					optional3: false,
					optional4: false,
					optional5: false,
					autofilling: false,
					lastdateedited: false,
					lasttimeedited: false,
					lasttimeeditor: false,
					type: true,
					save: false
				},
				"archive": {
					id: false,
					date: false,
					time: false,
					direction: false,
					wagon_number: false,
					start_weight: false,
					doc_start_weight: false,
					brutto: false,
					cargo_weight: false,
					overload: false,
					doc_cargo_weight: false,
					doc_number: false,
					doc_date: false,
					cargo_name: false,
					capacity: false,
					truck1_weight: false,
					ft_axis_1: false,
					ft_axis_2: false,
					ft_axis_3: false,
					ft_axis_4: false,
					truck2_weight: false,
					st_axis_1: false,
					st_axis_2: false,
					st_axis_3: false,
					st_axis_4: false,
					truck_diff: false,
					side_diff: false,
					offset_lengthwise: false,
					cross_offset: false,
					speed: false,
					sender: false,
					reciever: false,
					transporter: false,
					departure_point: false,
					destination_point: false,
					cargo: false,
					axels_count: false,
					photo_path: false,
					train_number: false,
					wagon_type: false,
					optional1: false,
					optional2: false,
					optional3: false,
					optional4: false,
					optional5: false,
					weight_type: false,
					autofilling: false,
					user: false,
					type: false,
					lastdateedited: false,
					lasttimeedited: false,
					lasttimeeditor: false
				}
			},
			info: {
				company: "rockIT",
				hardware: {
					weight_type: "ВТВ-СД-200",
					NPV: 150,
					discrete: 10,
					numberCI: 63155 - 16,
					accuracyClass: "OIML R76-1-2011-III",
					serial: "000000"
				},
				software: {
					name: "VTV",
					id: "Весы ВТВ",
					version: "15.02.003 от 22.06.2015",
					md5: "63705d4beb6e355f4e44d1a0da472d41"
				}
			},
			ids: {
				popupid: 1,
				popupbtn1: 1,
				popupbtn2: 1,
				dt1: 1,
				dt11: 1,
				win1: 1,
				win11: 1,
				close: 1,
				_shortname: 1,
				_fullname: 1,
				_inn: 1,
				_kpp: 1,
				_searcher: 1,
				_address: 1,
				popup: 1,
				wagonNumberWindowStatic: "",
				lockWindow: "",
				lockWindowBlockingLabel: "",
				warningWindow: "",
				passForCalibration: "",
				helpBtnID: "",
				adcWdwID: "",
				cameraWdwID: ""
			},
			dateFormat: "%d.%m.%Y",
			listLength: 1000,
			counts: 5,
			size: size(),
			views: {
				"interface": "settings.interface",
				"log-journal": "journal.log-journal",
				"access": "settings.access",
				"configuration": "settings.configuration",
				"hardware": "settings.hardware",
				"calibration": "settings.calibration",
				"verification": "settings.verification",
				"cameras": "settings.cameras",
				"archive": "journal.archive",
				"prearchive": "journal.prearchive",
				"static-wagon": "weighing.static-wagon",
				"dynamic": "weighing.dynamic"
			}
		};

		super({...defaults, ...config});

		let localeConfig = {};
		if (cookies)
			localeConfig.storage = webix.storage.local;

		this.use(plugins.Locale, localeConfig);
		this.use(plugins.User, {
			model: session,
			ping: false
		});

		webix.event(window, "resize", () => {
			const newSize = size();
			if (newSize != this.config.size) {
				this.config.size = newSize;
			}
		});

		this.attachEvent("app:error:resolve", function (err, url) {
			webix.delay(() => this.show("/top/weighing"));
		});

		const referenceView = this;
		function sendPing () {
			let _configuration = referenceView.config.configuration;
			let _methodName = "ping";
			webix.ajax().post(defaults.remoteHOSTstatus + "/ping/", {"method": _methodName}, function (text, xml, xhr) {
				let data = JSON.parse(text);
				if (data.method === _methodName) {
					if (data.answer === "pong") {
						_configuration.isServerConnection = true;
					}
					else _configuration.isServerConnection = false;
				}
				else _configuration.isServerConnection = false;
				newv => referenceView.app.config.configuration = _configuration;
				}).fail(function () {
				_configuration.isServerConnection = false;
				newv => referenceView.app.config.configuration = _configuration;
			});
			//console.log(referenceView.config.configuration.isServerConnection);
		}

		pingTimer = setInterval(function () {
			sendPing();
		}, 1000);

	}
}

if (!BUILD_AS_MODULE) {
	webix.ready(() => {
		if (!webix.env.touch && webix.env.scrollSize && webix.CustomScroll)
			webix.CustomScroll.init();
		new MyApp().render();
	});
}
