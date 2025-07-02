from .models import Message, MessageReact, MessageReactReceive, MessageReceiveForSend, MessageReciveForDelete, Notification, OnlineUser, Reactions
from APIs.serializers import MessageReactSerializer, NotificationSerializer, ReplySerializer
from channels.generic.websocket import AsyncWebsocketConsumer
from users.models import FriendRequest, SocialUser
from asgiref.sync import sync_to_async
from django.db import IntegrityError
import asyncio, json

class ChatConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        channel_name: str = self.scope['url_route']['kwargs']['channel_name']
        channel_id: int = self.scope['url_route']['kwargs']['channel_id']

        try:
            self.user: SocialUser = self.scope['user']
            
            if self.user.is_anonymous or not self.user.is_authenticated:
                await self.close()
                return
            
            self.chat_name = f"chat_{channel_name.strip().replace(' ', '_')}f_{channel_id}_t_{self.user.pk}"
            self.reverse_chat_name = f"chat_{self.user.username.strip().replace(' ', '_')}f_{self.user.pk}_t_{channel_id}"
            self.online_user_obj: OnlineUser
            
            
            self.to_user, self.online_user_obj, _ = await asyncio.gather(
                SocialUser.objects.aget(id=channel_id, username=channel_name),
                OnlineUser.objects.acreate(user=self.user, channel_name=self.channel_name),
                self.channel_layer.group_add(self.chat_name, self.channel_name) # type: ignore
            )
            
        except Exception as e:
            print(f"CONNECT ERROR: {e}")
            await self.close()
            return
        
        await self.accept(subprotocol=self.scope['org_subprotocols'])
    
    async def disconnect(self, code):
        try:
            await asyncio.gather(
                self.online_user_obj.adelete(),
                self.channel_layer.group_discard(self.chat_name, self.channel_name), # type: ignore
            )
        except Exception as e:
            print(e)
            await self.channel_layer.group_discard(self.chat_name, self.channel_name), # type: ignore
        finally:
            await self.close()
        
    async def create_notification(self, message: str):
        "a function to create a notification for the connected user"
        
        if not await OnlineUser.objects.filter(user=self.to_user).aexists():
            await Notification.objects.acreate(to_user=self.to_user, from_user=self.user, content=message)
        
    async def react_message_from_users(self, data):
        "a function to react to a message from the connected users"
        reacts_emojis: dict[Reactions, str] = {
            Reactions.LIKE: "👍",
            Reactions.DISLIKE: "👎",
            Reactions.LOVE: "❤️",
            Reactions.HAHA: "😂",
            Reactions.WOW: "😮",
            Reactions.SAD: "😢",
            Reactions.ANGRY: "😠",
            Reactions.COOL: "😎",
        }
        try:
            validated_data = MessageReactReceive(**data)
        except Exception as e:
            print(e)
            return
        
        try:
            reaction, created = await MessageReact.objects.aget_or_create(
                from_user=self.user,
                message_id=validated_data.message_id,
                reaction=validated_data.reaction
            )
        except IntegrityError: # triggered when the message already exists with different reaction
            try:
                reaction = await MessageReact.objects.aget(
                    from_user=self.user,
                    message_id=validated_data.message_id,
                )
                reaction.reaction = validated_data.reaction
                created = "replace"
                await reaction.asave()
            except Exception as e:
                print(repr(e))
                return
        

        sending = await sync_to_async(lambda: MessageReactSerializer(reaction).data)()
        sending.update({'event_type': 'react'}) # type: ignore
        
        if created == True:
            sending.update({'msg_event_type': 'add'}) # type: ignore
            await asyncio.gather(
                self.send_both(sending),
                self.create_notification(f"reacted {reacts_emojis.get(validated_data.reaction, reacts_emojis[Reactions.LIKE])} to {await sync_to_async(lambda: reaction.message.message)()}")
            )
            return
        elif created == "replace":
            sending.update({'msg_event_type': 'replace'}) # type: ignore
            await asyncio.gather(
                self.send_both(sending),
                self.create_notification(f"reacted {reacts_emojis.get(validated_data.reaction, reacts_emojis[Reactions.LIKE])} to {await sync_to_async(lambda: reaction.message.message)()}")
            )
            return
        elif created == False:
            sending.update({'msg_event_type': 'remove'}) # type: ignore
            await asyncio.gather(
                self.send_both(sending),
                reaction.adelete()
            )
        
    async def send_message_to_users(self, data):
        "a function to send a new Message to the connected users"
        
        try:
            validated_data = MessageReceiveForSend(**data)
        except Exception as e:
            print(e)
            return
        
        message = await (
            Message.objects
            .only(
                'id', 
                'message', 
                'sent_at', 
                'replied_to',
                'from_user__id', 
                'from_user__username',
                'from_user__profile_picture',
                'to_user__id', 
                'to_user__username'
                'to_user__profile_picture'
            )
            .select_related("from_user", "to_user", "replied_to")
            .acreate(
                from_user=self.user, 
                to_user=self.to_user, 
                message=validated_data.message,
                replied_to_id=None if validated_data.replying_to <= 0 else validated_data.replying_to
            )
        )

        sending = {
            "event_type": "send",
            "from_user": message.from_user.username,
            "from_user_id": message.from_user.id, # type: ignore
            "from_user_profile_picture": message.from_user.profile_picture.url,
            "to_user": message.to_user.username,
            "to_user_id": message.to_user.id, # type: ignore
            "to_user_profile_picture": message.to_user.profile_picture.url,
            "id": message.id, # type: ignore
            "message": message.message,
            "sent_at": str(message.sent_at),
            "replied_to": await sync_to_async(lambda: ReplySerializer(message.replied_to).data)(),
        }
        
        await asyncio.gather(
            self.send_both(sending),
            self.create_notification(validated_data.message)
        )
            
    async def delete_message_from_users(self, data):
        "a function to delete a Message for the connected user"
        
        try:
            validated_data = MessageReciveForDelete(**data)
        except Exception as e:
            print(e)
            return
        
        await (
            Message.objects
            .only('id')
            .filter(
                from_user=self.user, 
                to_user=self.to_user, 
                id=validated_data.id
            ).adelete()
        )
        
        sending = {
            "event_type": "delete",
            "id": validated_data.id,
        }
        
        await self.send_both(sending)
    
    async def receive(self, text_data: str | None =None, bytes_data=None):
        if not text_data:
            return
        
        data: dict = json.loads(text_data)

        match (data.get("event_type")):
            case 'send':
                await self.send_message_to_users(data)
            case "delete":
                await self.delete_message_from_users(data)
            case "react":
                await self.react_message_from_users(data)
            case _:
                return
    
    async def send_both(self, data):
        await asyncio.gather(
            # send to user
            self.channel_layer.group_send( # type: ignore
                self.chat_name,
                {
                    "type": "send.message",
                    "data": data
                }
            ),
            # send it back (confirmation)
            self.channel_layer.group_send( # type: ignore
                self.reverse_chat_name,
                {
                    "type": "send.message",
                    "data": data
                }
            )
        )
        
    async def send_message(self, event):
        await self.send(
            json.dumps(event["data"])
        )


class NotificationConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.user: SocialUser = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        
        self.username = self.user.username.replace(" ", "")
        self.user_channel = f"notif_{self.username}_{self.user.pk}"
        await self.channel_layer.group_add(self.user_channel, self.channel_name) # type: ignore
        await self.accept(subprotocol=self.scope["org_subprotocols"])
        
    async def disconnect(self, code):
        try:
            await asyncio.gather(
                self.channel_layer.group_discard(self.user_channel, self.channel_name), # type: ignore
                self.close()
            )
        except Exception as e:
            print(f"Error disconnecting: {e}")
            await self.close()
        
    async def receive(self, text_data: str | None=None, bytes_data=None):
        if not text_data:
            return
        
        data: dict[str, str] = json.loads(text_data)
        
        match (data.get("event_type")):
            case "get_notifi":
                await self.channel_layer.group_send( # type: ignore
                    self.user_channel,
                    {
                        "type": "notifi.send",
                        "data": {}
                    }
                )
            case "delete_notifi":
                
                await self.channel_layer.group_send( # type: ignore
                    self.user_channel,
                    {
                        "type": "notifi.delete",
                        "data": {
                            "ids": data.get("ids"),
                            "status": True
                        }
                    }
                )

    async def notifi_send(self, _):
        friends_requests_count, notifications = await asyncio.gather(
            FriendRequest.objects.filter(friend=self.user).acount(),
            sync_to_async(lambda: Notification.objects.filter(to_user=self.user).order_by('-created_at'))()
        )
        notifications_data = await sync_to_async(lambda: NotificationSerializer(notifications, many=True).data)()
        await self.send(json.dumps({
            "event_type": "notifi_recived",
            "friends_requests_count": friends_requests_count, 
            "notifications": notifications_data
        }))
    
    async def notifi_delete(self, event: dict):
        ids: list[int] = event["data"].get("ids")
        event["data"]["event_type"] = "notifi_deleted",
        if not ids:
            return
        
        try:
            await Notification.objects.filter(id__in=ids).adelete()
        except:
            event["data"]["status"] = False
        finally:
            await self.send(json.dumps(event["data"]))
            
    async def post_ready(self, event: dict):
        """A function to send a notification when a post is ready"""
        await self.send(json.dumps({
            "event_type": "post_ready",
            "message": event.get("message"),
            "post_id": event.get("post_id")
        }))
        
        