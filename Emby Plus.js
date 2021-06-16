if ($request.url.indexOf('mb3admin.com/admin/service/registration/validateDevice') != -1) {
      if($response.status!=200){
          $notification.post("你的小🉑爱已上线", "", "");
          $done({status: 200, headers: $response.headers, body: '{"cacheExpirationDays":999,"resultCode":"GOOD","message":"Device Valid"}' })
      }else{
          $done({})
      }
  }else{
      $done({})
  }
