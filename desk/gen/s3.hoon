/+  s3,aws
:-  %say
|=  [[now=@da eny=@uvJ bec=beak] [bucket=@t endpoint=@t reg=@t secret=@t key=@t ~] [* ~]]
=/  client  ~(. s3 [endpoint reg secret key now])
:-  %noun
+:(list-objects-v2:client bucket)