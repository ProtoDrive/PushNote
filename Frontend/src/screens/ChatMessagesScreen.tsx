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

export default function ChatMessagesScreen(): JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  const userData = useSelector((state: any) => state?.reducer);

  const route = useRoute<any>();
  const {userId, organizationId} = route.params;

  const [showEmojiSelector, setShowEmojiSelector] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<any>(null);
  const [messages, setMessages] = useState<any>([]);
  const [organization, setOrganization] = useState<any>({});
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

  useEffect(() => {
    const fetchOrganizationData = async () => {
      try {
        const response = await axios.get(
          `${API_URI}/organizations/${organizationId}`,
        );
        setOrganization(response.data.organization);
      } catch (err) {
        console.log(
          `Error fetching organization data for ID ${organizationId}:`,
          err,
        );
        return null;
      }
    };

    fetchOrganizationData();
  }, []);

  const fetchMessages = async () => {
    await axios
      .get(`${API_URI}/organization-messages/${organizationId}`)
      .then(res => {
        setMessages(res.data.organizationMessages);
      })
      .catch(err => console.log(err));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleEmojiPress = () => {
    setShowEmojiSelector(!showEmojiSelector);
  };

  const handleSend = async (messageType: any, imageUri: any) => {
    axios
      .post(`${API_URI}/organization-messages`, {
        senderId: userId,
        organizationId: organizationId,
        messageType: messageType,
        messageText: message,
        timestamp: new Date(),
        image: imageUri,
      })
      .then(response => {
        setMessage('');
        setImage(null);
        setShowEmojiSelector(false);
        fetchMessages();
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
      console.log(result.assets);
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

          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            {organization?.image?.length < 5 ? (
              <Image
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  resizeMode: 'cover',
                }}
                source={require('../../assets/Profile/nodp.png')}
              />
            ) : (
              <Image
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  resizeMode: 'cover',
                }}
                source={{uri: `data:image/png;base64,${organization.image}`}}
              />
            )}

            <Text
              style={{
                marginLeft: 5,
                fontFamily: 'Poppins-Medium',
                color: Colors.onPrimary,
                fontSize: 19,
              }}>
              {organization?.name}
            </Text>
          </View>
        </View>
      ),
      headerRight: () => (
        <View>
          {organization.admin == userData.data._id && (
            <Menu>
              <MenuTrigger>
                <Entypo
                  name="dots-three-vertical"
                  size={20}
                  color={Colors.onPrimary}
                />
              </MenuTrigger>
              <MenuOptions>
                <MenuOption
                  onSelect={() =>
                    navigation.navigate('createtask', {
                      organizationId: organizationId,
                    })
                  }
                  text="Create task"
                  style={{
                    padding: 15,
                  }}
                />
              </MenuOptions>
            </Menu>
          )}
        </View>
      ),
    });
  }, [organization]);

  return (
    <KeyboardAvoidingView
      style={{flex: 1, backgroundColor: Colors.backgroundColor}}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{flexGrow: 1}}
        onContentSizeChange={handleContentSizeChange}>
        {messages.map((item: any, index: any) => {
          if (item?.messageType === 'text') {
            return (
              <Pressable
                key={index}
                style={[
                  item?.senderId === userId
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
                      item?.senderId === userId
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
                      item?.senderId === userId
                        ? Colors.onPrimary
                        : Colors.backgroundColor,
                    marginTop: 5,
                  }}>
                  {formatTime(item.timestamp)}
                </Text>
              </Pressable>
            );
          }

          if (item.messageType === 'image') {
            return (
              <Pressable
                key={index}
                style={[
                  item?.senderId === userId
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
                    {formatTime(item?.timestamp)}
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
