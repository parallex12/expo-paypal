import React, { useRef, useEffect, useState } from 'react';
import { View, Platform, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAssets } from "expo-asset";
import { useWindowDimensions } from 'react-native';

const PayPal = (props) => {
  const [loader, setLoader] = useState(true)
  const [visible, setVisible] = useState(false)
  const [assets, error] = useAssets([require('./paypal.html')])
  const webviewRef = useRef()
  let { width, height } = useWindowDimensions();
  const [renderedOnce, setRenderedOnce] = useState(false)
  const [dataFromWebView, setDataFromWebView] = useState()
  let js = `document.getElementById("p").innerHTML=${props?.amount}`

  const updateSource = () => {
    setRenderedOnce(true)
  }

  const onMessage = (data) => {
    try {
      setLoader(true)
      setDataFromWebView(data.nativeEvent.data);
      let d = JSON.parse(data.nativeEvent.data)
      if (d.status == "COMPLETED") {
        setTimeout(() => {
          setLoader(false)
          props?.success(d)
          setVisible(false)
        }, 2000);
      } else {
        props?.failed("Something went wrong!")
        alert("Something went wrong!")
      }
    } catch (e) {
      console.log(e)
      props?.failed(e)
    }

  }

  const passValues = () => {
    webviewRef.current.postMessage(JSON.stringify({ amount: props?.amount }));
  }

  useEffect(() => {
    const interval = setTimeout(() => {
      setLoader(false)
    }, Platform.OS == "ios" ? 3000 : 5000);
    return () => clearInterval(interval);
  }, []);

  const onOpen = () => {
    props?.onPress(() =>
      setVisible(!visible)
    )
  }
  return (
    <>
      {visible ?
        <View style={[styles.paypalCont, { width: width / 1.08, height: height / 2.3 }, { ...props?.popupContainerStyle }]}>
          <View style={styles.innerCont}>
            {loader && <View style={styles.loader}>
              <ActivityIndicator size="large" color="#fff" />
            </View>}
            <View style={{ flex: 1 }}>
              {
                assets !== undefined &&
                error === undefined &&
                assets[0].localUri !== null && (
                  <WebView ref={webviewRef}
                    source={renderedOnce ? { uri: assets[0].localUri } : { uri: "https://paypal.com" }}
                    scalesPageToFit={false}
                    useWebKit={Platform.OS == 'ios'}
                    onLoadEnd={() => passValues()}
                    allowFileAccess={true}
                    mixedContentMode="compatibility"
                    style={{ width: '100%', height: '100%' }}
                    onMessage={onMessage}
                    allowUniversalAccessFromFileURLs={true}
                    originWhitelist={['*']}
                    javaScriptEnabledAndroid={true}
                    javaScriptEnabled={true}
                    injectedJavaScript={js}
                    onLoad={updateSource}
                  />
                )}
            </View>
            <TouchableOpacity style={[styles.paypalBtn, { ...props?.cancelBtnStyles }]} onPress={() => setVisible(false)}>
              <Text style={[styles.btnText, { ...props?.cancelBtnStyles }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
        : <></>
      }
      <TouchableOpacity style={[styles.paypalBtn, { ...props?.buttonStyles }]} onPress={onOpen}>
        <Text style={[styles.btnText, { ...props?.btnTextStyles }]}>{props?.title || "Pay with Paypal"}</Text>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  loader: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    opacity: 0.5,
    position: 'absolute',
    zIndex: 999999999,
    alignItems: 'center',
    justifyContent: 'center'
  },
  paypalCont: {
    position: 'absolute',
    borderRadius: 10,
    // bottom: 0,
    backgroundColor: '#fff',
    zIndex: 99999999999999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerCont: {
    paddingTop: 50,
    width: '95%',
    height: '100%',
    overflow: 'hidden'
  },
  paypalBtn: {
    width: 300,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5
  },
  btnText: {
    fontSize: 17,
    color: '#222',
    fontWeight: '600'
  }
})
export default PayPal