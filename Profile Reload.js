$httpAPI("POST", "/v1/profiles/reload", {}, data => {
    $notification.post("配置刷新","成功","")
    $done({
        title: "𝑷𝒓𝒐𝒇𝒊𝒍𝒆 𝑹𝒆𝒍𝒐𝒂𝒅",
        content: "配置刷新成功",
        icon: "arrow.triangle.2.circlepath.doc.on.clipboard",
        "icon-color": "#8B81C3",
     })
    });
