import {
  View,
  Text,
  KeyboardAvoidingViewComponent,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Alert,
  Button,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation, useRoute} from '@react-navigation/native';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EmojiSelector from 'react-native-emoji-selector';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

//Files
import Colors from '../components/constants/Colors';
import axios from 'axios';
import {API_URI} from '../utils/constants';
import {useSelector} from 'react-redux';

export default function TaskMessagesScreen(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const userData = useSelector((state: any) => state?.reducer);

  const route = useRoute<any>();
  const {taskData, taskId} = route.params;

  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [taskMsgs, setTaskMsgs] = useState<any>([]);
  const [modelOpen, setModelOpen] = useState(false);

  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({animated: false});
    }
  };

  const handleContentSizeChange = () => {
    scrollToBottom();
  };

  const fetchTaskMsgsData = async () => {
    try {
      const response = await axios.get(`${API_URI}/messages/${taskData._id}`);
      setTaskMsgs(response.data.messages);
    } catch (err) {
      console.log(`Error fetching organization data for ID ${taskId}:`, err);
      return null;
    }
  };

  useEffect(() => {
    fetchTaskMsgsData();
  }, []);

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const handleSend = async (messageType: any, imageUri: any) => {
    axios
      .post(`${API_URI}/messages`, {
        senderId: userData.data._id,
        recepientId: taskData.assignedUser._id,
        messageType: messageType,
        messageText: message,
        timestamp: new Date(),
        image: imageUri,
        taskId: taskData._id,
      })
      .then(response => {
        setMessage('');
        setImage(null);
        setShowEmojiSelector(false);
        fetchTaskMsgsData();
      })
      .catch(error => {
        console.log(error);
      });
  };

  const selectImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      includeBase64: true,
    });
    if (result?.assets) {
      setImage(result?.assets[0]?.base64);
      handleSend('image', result?.assets[0]?.base64);
    }
  };

  const formatTime = (time: any) => {
    const options: any = {hour: 'numeric', minute: 'numeric'};
    return new Date(time).toLocaleString('en-US', options);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: Colors.theme,
      },
      headerTintColor: Colors.onPrimary,
      headerTitleStyle: {
        color: Colors.onPrimary,
        fontSize: 20,
      },
      headerTitle: '',
      headerLeft: () => (
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
          <Ionicons
            onPress={() => navigation.goBack()}
            name="arrow-back"
            size={24}
            color={Colors.onPrimary}
          />

          <View style={{flexDirection: 'row', alignItems: 'center', gap: 25}}>
            <View style={{display: 'flex', flexDirection: 'row'}}>
              {taskData.assignedUser.image.length > 3 ? (
                <Image
                  source={{
                    uri: `data:image/png;base64,${taskData.assignedUser.image}`,
                  }}
                  style={{width: 35, height: 35, borderRadius: 100}}
                />
              ) : (
                <Image
                  source={require('../../assets/Profile/nodp.png')}
                  style={{width: 35, height: 35, borderRadius: 100}}
                />
              )}
              {taskData.createdByUser.image.length > 3 ? (
                <Image
                  source={{
                    uri: `data:image/png;base64,${taskData.createdByUser.image}`,
                  }}
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 100,
                    position: 'absolute',
                    left: 20,
                  }}
                />
              ) : (
                <Image
                  source={require('../../assets/Profile/nodp.png')}
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 100,
                    position: 'absolute',
                    left: 20,
                  }}
                />
              )}
            </View>

            <Text
              style={{
                marginLeft: 5,
                fontFamily: 'Poppins-Medium',
                color: Colors.onPrimary,
                fontSize: 19,
              }}>
              {taskData?.title}
            </Text>
          </View>
        </View>
      ),
    });
  }, [taskData]);

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{flexGrow: 1}}
        onContentSizeChange={handleContentSizeChange}>
        {taskMsgs.map((item: any, index: any) => {
          if (item?.messageType === 'text') {
            return (
              <Pressable
                key={index}
                style={[
                  item?.senderId === userData.data._id
                    ? {
                        alignSelf: 'flex-end',
                        backgroundColor: Colors.theme,
                        padding: 8,
                        maxWidth: '60%',
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: 'flex-start',
                        backgroundColor: 'white',
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: '60%',
                      },
                ]}>
                <Text
                  style={{
                    fontSize: 16,
                    textAlign: 'left',
                    fontFamily: 'Poppins-Medium',
                    color:
                      item?.senderId === userData.data._id
                        ? Colors.onPrimary
                        : Colors.backgroundColor,
                  }}>
                  {item?.message}
                </Text>
                <Text
                  style={{
                    textAlign: 'right',
                    fontSize: 11,
                    fontFamily: 'Poppins-Regular',
                    color:
                      item?.senderId === userData.data._id
                        ? Colors.onPrimary
                        : Colors.backgroundColor,
                    marginTop: 5,
                  }}>
                  {formatTime(item.timeStamp)}
                </Text>
              </Pressable>
            );
          }

          if (item.messageType === 'image') {
            return (
              <Pressable
                key={index}
                style={[
                  item?.senderId === userData.data._id
                    ? {
                        alignSelf: 'flex-end',
                        backgroundColor: Colors.theme,
                        padding: 8,
                        maxWidth: '60%',
                        borderRadius: 7,
                        margin: 10,
                      }
                    : {
                        alignSelf: 'flex-start',
                        backgroundColor: 'white',
                        padding: 8,
                        margin: 10,
                        borderRadius: 7,
                        maxWidth: '60%',
                      },
                ]}>
                <View>
                  <Image
                    source={{uri: `data:image/png;base64,${item.imageUrl}`}}
                    style={{width: 200, height: 200, borderRadius: 7}}
                  />
                  <Text
                    style={{
                      textAlign: 'right',
                      fontSize: 11,
                      position: 'absolute',
                      right: 10,
                      bottom: 7,
                      color: 'white',
                      marginTop: 5,
                    }}>
                    {formatTime(item?.timeStamp)}
                  </Text>
                </View>
              </Pressable>
            );
          }
        })}
      </ScrollView>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 10,
          paddingVertical: 10,
          borderTopWidth: 1,
          borderTopColor: '#dddddd',
          marginBottom: showEmojiSelector ? 0 : 25,
        }}>
        <Entypo
          onPress={handleEmojiPress}
          style={{marginRight: 5}}
          name="emoji-happy"
          size={24}
          color="white"
        />

        <TextInput
          value={message}
          onChangeText={text => setMessage(text)}
          style={{
            flex: 1,
            height: 40,
            borderWidth: 1,
            borderColor: Colors.onPrimary,
            borderRadius: 20,
            paddingHorizontal: 10,
            backgroundColor: Colors.onPrimary,
          }}
          placeholder="Type Your message..."
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            marginHorizontal: 8,
          }}>
          <Entypo
            onPress={selectImage}
            name="camera"
            size={24}
            color={Colors.onPrimary}
          />
        </View>

        <Pressable
          onPress={() => handleSend('text', '')}
          style={{
            backgroundColor: Colors.theme,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 20,
          }}>
          <Text style={{color: 'white', fontWeight: 'bold'}}>Send</Text>
        </Pressable>
      </View>

      {showEmojiSelector && (
        <EmojiSelector
          onEmojiSelected={emoji => {
            setMessage(prevMessage => prevMessage + emoji);
          }}
        />
      )}
    </KeyboardAvoidingView>
  );
}
