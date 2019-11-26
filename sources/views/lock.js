import {JetView} from "webix-jet";

export default class LoginView extends JetView{
    config(){
        const _ = this.app.getService("locale")._;
			  const theme = this.app.config.theme;

        const login_form = {
            view:"form", localId:"login:form",
            width:400, borderless:false, margin:10,
            rows:[
                { type:"header", template: _("Locked") },
                { cols: [
                    {},
                    {
                        view:"label", name:"login", label: this.app.config['credentials'], labelPosition:"top",
                        value: this.app.config['user_name']
                    },
                    {}
                    ]
                },
                { view:"text", type:"password", name:"pass", label:"Password", labelPosition:"top" },
                { view:"button", value: _("Login"), click:() => this.do_login(this), hotkey:"enter" },
            ],
            rules:{
                pass:webix.rules.isNotEmpty
            }
        };

        return {
            css:{
                "background-image": 'url("assets/img/frame.png") !important',
                "background-repeat": 'no-repeat !important',
                "background-position": 'right bottom !important',
            },
            cols:[{}, { rows:[{}, login_form, {}]}, {}]
        };
    }

   init(view){
        this.app.callEvent("chartStaticUpdateStop");
        this.app.callEvent("chartStaticWagonUpdateStop");
		    this.app.callEvent("chart3StaticCalibrationUpdateStop");
		    this.app.callEvent("chart2StaticCalibrationUpdateStop");
		    this.app.callEvent("chart1StaticCalibrationUpdateStop");
		    this.app.callEvent("setExchange=nothing");
        view.$view.querySelector("input").focus();
   }

    do_login(xx){
        const user = this.app.getService("user");
        const form = this.$$("login:form");
        window.storage = {}; // для пространства имен, что бы много мусора в window не пихать
        window.storage.globalVar = xx;

        if (form.validate()) {
            const data = form.getValues();
            user.login(data.login, data.pass, data.xx).catch(function(){
                webix.html.removeCss(form.$view, "invalid_login");
                form.elements.pass.focus();
                webix.delay(function(){
                    webix.html.addCss(form.$view, "invalid_login");
                });
            });
        }
    }

    close_app(){

    }
}