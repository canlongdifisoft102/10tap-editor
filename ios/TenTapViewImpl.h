#import <UIKit/UIKit.h>
#import <React/RCTUIManager.h>

@interface TenTapViewImpl : UIView

@property (nonatomic, copy) NSNumber *inputTag;
@property (nonatomic, weak) RCTBridge *bridge;

@end
