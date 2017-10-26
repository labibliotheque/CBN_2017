# encoding: UTF-8

# GITHUB API emulator
# launch with :
# $ ruby -I . local.rb
# and open http://localhost:4567/lb_backoffice/index.html

require 'sinatra'
require "base64"
require "json"

set :public_folder, '.'

helpers do
  def protected!
    return if authorized?
    # headers['WWW-Authenticate'] = 'Basic realm="Restricted Area"'
    halt 401, "Not authorized\n"
  end
  def authorized?
    @auth ||=  Rack::Auth::Basic::Request.new(request.env)
    @auth.provided? and @auth.basic? and @auth.credentials and @auth.credentials == ['admin', '1234']
  end
end


# https://developer.github.com/v3/repos/contents/#create-a-file

get '/user' do 
    protected!

    content_type :json
    { fake: "fake" }.to_json
end

get '/repos/:owner/:repo/contents/*' do |owner, repo, *remain|
    path = params['splat'].first
    halt 404 unless File.exists?(path)
    content_type :json, charset: 'utf-8'
    {
        sha: 'fake SHA code for this blob',
        content: Base64.encode64(File.read(path))
    }.to_json
end

put '/repos/:owner/:repo/contents/*' do |owner, repo, *remain|
    
    protected!

    path = params['splat'].first
    p [owner, repo, path]

    
    data = JSON.parse(request.body.read)

    content = Base64.decode64(data["content"]).force_encoding("UTF-8").encode

    File.write(path, content)

    content_type :json
    { fake: "fake" }.to_json
end